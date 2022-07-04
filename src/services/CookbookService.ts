import { PromisedValue, arr, isObject, tap, uuid } from '@noeldemartin/utils';
import { SolidContainerModel } from 'soukai-solid';
import type { FluentArray, Obj } from '@noeldemartin/utils';

import Auth from '@/framework/core/facades/Auth';
import Cloud from '@/framework/core/facades/Cloud';
import Events from '@/framework/core/facades/Events';
import Files from '@/framework/core/facades/Files';
import Service from '@/framework/core/Service';
import { setRemoteCollection } from '@/framework/cloud/remote_helpers';
import type { ComputedStateDefinitions, IService } from '@/framework/core/Service';

import Recipe from '@/models/Recipe';
import Network from '@/framework/core/facades/Network';

declare module '@/framework/core/services/EventsService' {

    export interface EventsPayload {
        'recipe-created': void;
        'recipe-deleted': void;
    }

}

interface State {
    localCookbookUrl: string;
    remoteCookbookUrl: string | null;
    cookbook: PromisedValue<SolidContainerModel>;
    allRecipes: FluentArray<Recipe>;
}

interface ComputedState {
    isLocal: boolean;
    isRemote: boolean;
    recipes: FluentArray<Recipe>;
}

export default class CookbookService extends Service<State, ComputedState> {

    public static persist: Array<keyof State> = ['remoteCookbookUrl'];

    private tmpRecipes: Record<string, Recipe> = {};

    public get isReady(): boolean {
        return this.cookbook.isResolved();
    }

    public async createRemote(name: string, storageUrl: string): Promise<void> {
        const user = Auth.requireUser();
        const engine = Auth.requireAuthenticator().engine;
        const cookbook = await SolidContainerModel.withEngine(engine, async () => tap(
            new SolidContainerModel({ name }),
            async cookbook => {
                const typeIndexUrl = user.privateTypeIndexUrl ?? await Auth.createPrivateTypeIndex();

                await cookbook.save(storageUrl);
                await cookbook.register(typeIndexUrl, Recipe);
            },
        ));

        await this.setRemoteCookbook(cookbook);
        await this.reloadRecipes();
    }

    public async deleteRecipe(recipe: Recipe): Promise<void> {
        if (this.isRemote) {
            await recipe.softDelete();
            await (Network.online && Cloud.sync());

            return;
        }

        await recipe.delete();
    }

    public saveTmpRecipe(recipe: Recipe): string {
        return tap(uuid(), id => this.tmpRecipes[id] = recipe);
    }

    public getTmpRecipe(id: string): Recipe | null {
        return this.tmpRecipes[id] ?? null;
    }

    protected async boot(): Promise<void> {
        await super.boot();
        await Auth.ready;
        await this.loadCookbook();
        await this.loadRecipes();
        await this.enqueueFileUploads();

        Events.on('login', async () => {
            // TODO this should be refactored, because technically the cookbook is already loaded (it's just the local
            // one, not the remote, that's why this works now). Instead we should migrate both the local cookbook and
            // the recipes to match the remote declarations.
            await this.loadCookbook();
        });

        Events.on('logout', async () => {
            Recipe.collection = this.localCookbookUrl;

            await Promise.all(this.allRecipes.map(async recipe => {
                if (recipe.imageUrl?.startsWith(this.localCookbookUrl))
                    await Files.delete(recipe.imageUrl);

                await recipe.delete();
            }));

            this.setState({
                remoteCookbookUrl: null,
                cookbook: new PromisedValue,
                allRecipes: arr<Recipe>(),
            });
        });

        Recipe.on('deleted', recipe => {
            this.setState({ allRecipes: this.allRecipes.without([recipe]) });

            Events.emit('recipe-deleted');
        });
        Recipe.on('created', recipe => {
            this.setState({ allRecipes: this.allRecipes.concat([recipe]) });

            Events.emit('recipe-created');
        });

        // TODO investigate a different way to work around reactivity issues
        Recipe.on('updated', () => this.setState({ allRecipes: this.allRecipes.slice(0) }));
    }

    protected getInitialState(): State {
        return {
            localCookbookUrl: Recipe.collection,
            remoteCookbookUrl: null,
            cookbook: new PromisedValue,
            allRecipes: arr<Recipe>([]),
        };
    }

    protected getComputedStateDefinitions(): ComputedStateDefinitions<State, ComputedState> {
        return {
            isLocal: ({ remoteCookbookUrl }) => !remoteCookbookUrl,
            isRemote: ({ remoteCookbookUrl }) => !!remoteCookbookUrl,
            recipes: ({ allRecipes }) => allRecipes.filter(recipe => !recipe.isSoftDeleted()),
        };
    }

    private async loadRecipes(): Promise<void> {
        const recipes = await Recipe.all();

        this.allRecipes = arr(recipes);
    }

    protected async reloadRecipes(): Promise<void> {
        await this.loadRecipes();
    }

    private async loadCookbook(): Promise<void> {
        if (Auth.isLoggedIn()) {
            const engine = Auth.authenticator.engine;
            const cookbook = await SolidContainerModel.withEngine(engine, async () => tap(
                await this.findCookbook(),
                cookbook => cookbook && this.setRemoteCookbook(cookbook),
            ));

            cookbook && this.cookbook.resolve(cookbook);

            return;
        }

        Recipe.collection = this.remoteCookbookUrl ?? this.localCookbookUrl;

        this.cookbook.resolve(new SolidContainerModel({ url: Recipe.collection, name: 'cookbook' }));
    }

    private async setRemoteCookbook(cookbook: SolidContainerModel): Promise<void> {
        await this.migrateLocalRecipes(cookbook.url);

        setRemoteCollection(Recipe, cookbook.url);

        if (cookbook.url !== this.remoteCookbookUrl)
            this.setState({ remoteCookbookUrl: cookbook.url });

        this.cookbook.resolve(cookbook);
    }

    private async findCookbook(refreshStaleProfile: boolean = true): Promise<SolidContainerModel | null> {
        const user = Auth.requireUser();

        try {
            return user.privateTypeIndexUrl
                ? await SolidContainerModel.fromTypeIndex(user.privateTypeIndexUrl, Recipe)
                : null;
        } catch (error) {
            // TODO check that error was NetworkRequestError
            if (!refreshStaleProfile)
                throw error;

            await Auth.refreshUserProfile();
            await Auth.createPrivateTypeIndex();

            return this.findCookbook(false);
        }
    }

    private async migrateLocalRecipes(remoteCollection: string): Promise<void> {
        const recipes = await Recipe.all();
        const engine = Recipe.requireEngine();
        const migrateLocalUrls = (document: Obj): [string, string][] => {
            const fileRenames: [string, string][] = [];

            for (const [field, value] of Object.entries(document)) {
                if (isObject(value)) {
                    fileRenames.push(...migrateLocalUrls(value));

                    continue;
                }

                if (typeof value !== 'string' || !value.startsWith(Recipe.collection))
                    continue;

                switch (field) {
                    case '@id':
                        document[field] = value.replace(Recipe.collection, remoteCollection);

                        continue;
                    case 'image':
                        document[field] = value.replace(Recipe.collection, remoteCollection);
                        fileRenames.push([value, document[field] as string]);

                        continue;
                }
            }

            return fileRenames;
        };

        for (const recipe of recipes) {
            if (recipe.url.startsWith(remoteCollection))
                continue;

            const documentUrl = recipe.requireDocumentUrl();
            const document = await engine.readOne(Recipe.collection, documentUrl);
            const fileRenames = migrateLocalUrls(document);

            await Promise.all(fileRenames.map(async ([url, newUrl]) => {
                await Files.rename(url, newUrl);

                Cloud.enqueueFileUpload(newUrl);
            }));
            await engine.create(remoteCollection, document, documentUrl.replace(Recipe.collection, remoteCollection));
            await engine.delete(Recipe.collection, documentUrl);
        }
    }

    private async enqueueFileUploads(): Promise<void> {
        if (!this.remoteCookbookUrl)
            return;

        const urls = await Files.getUrls();

        for (const url of urls) {
            if (!url.startsWith(this.remoteCookbookUrl))
                continue;

            Cloud.enqueueFileUpload(url);
        }
    }

}

export default interface CookbookService extends IService<State, ComputedState> {}
