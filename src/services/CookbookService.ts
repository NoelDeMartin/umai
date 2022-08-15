import { PromisedValue, arr, isObject, requireUrlParentDirectory, tap, uuid } from '@noeldemartin/utils';
import { SolidContainerModel, SolidTypeRegistration } from 'soukai-solid';
import { SolidDocumentPermission, findInstanceRegistrations } from '@noeldemartin/solid-utils';
import type { FluentArray, Obj } from '@noeldemartin/utils';

import Auth from '@/framework/core/facades/Auth';
import Cloud from '@/framework/core/facades/Cloud';
import Events from '@/framework/core/facades/Events';
import Files from '@/framework/core/facades/Files';
import Service from '@/framework/core/Service';
import { setRemoteCollection } from '@/framework/cloud/remote_helpers';
import type { ComputedStateDefinitions, IService } from '@/framework/core/Service';

import Network from '@/framework/core/facades/Network';
import Recipe from '@/models/Recipe';
import RecipesList from '@/models/RecipesList';

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
    publicRecipesList: RecipesList | null;
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

    public async initializeRemote(name: string, storageUrl: string): Promise<void> {
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

        await this.initializeRemoteCookbook(cookbook);
        await this.reloadRecipes();
    }

    public getTmpRecipe(id: string): Recipe | null {
        return this.tmpRecipes[id] ?? null;
    }

    public saveTmpRecipe(recipe: Recipe): string {
        return tap(uuid(), id => this.tmpRecipes[id] = recipe);
    }

    public async deleteRecipe(recipe: Recipe): Promise<void> {
        if (this.isRemote) {
            await recipe.softDelete();
            await (Network.online && Cloud.sync(recipe));

            return;
        }

        if (recipe.imageUrl && await Files.has(recipe.imageUrl)) {
            await Files.delete(recipe.imageUrl);
        }

        await recipe.delete();
    }

    public async updatePublicRecipeListing(recipe: Recipe, publish: boolean): Promise<void> {
        const publicRecipesList = await this.loadPublicRecipesList();

        if (publish && !publicRecipesList.has(recipe)) {
            publicRecipesList.relatedItems.attach({ recipeUrl: recipe.url });

            recipe.listUrls = [...recipe.listUrls, publicRecipesList.url];
        }

        if (!publish && publicRecipesList.has(recipe)) {
            const item = publicRecipesList.items?.find(item => item.recipeUrl === recipe.url);

            item && publicRecipesList.relatedItems.detach(item);

            recipe.listUrls = recipe.listUrls.filter(url => url !== publicRecipesList.url);
        }

        if (publicRecipesList.exists() || (publicRecipesList.items && publicRecipesList.items.length > 0)) {
            await RecipesList.withEngine(
                Auth.requireAuthenticator().engine,
                () => publicRecipesList.save(),
            );
        }

        if (publicRecipesList.exists() && publicRecipesList.wasRecentlyCreated() && !publicRecipesList.isRegistered) {
            await this.registerPublicRecipesList(publicRecipesList);
        }

        if (recipe.isDirty()) {
            await recipe.save();
            await Cloud.sync(recipe);
        }
    }

    protected async boot(): Promise<void> {
        await super.boot();
        await Auth.ready;
        await this.loadCookbook();
        await this.loadRecipes();
        await this.enqueueFileUploads();

        Events.on('login', async session => {
            // TODO this should be refactored, because technically the cookbook is already loaded (it's just the local
            // one, not the remote, that's why this works now). Instead we should migrate both the local cookbook and
            // the recipes to match the remote declarations.
            await this.loadCookbook();

            RecipesList.setEngine(session.authenticator.engine);
            SolidTypeRegistration.setEngine(session.authenticator.engine);
        });

        Events.on('logout', async () => {
            Recipe.collection = this.localCookbookUrl;

            await Promise.all(this.allRecipes.map(async recipe => {
                if (recipe.imageUrl?.startsWith(this.localCookbookUrl)) {
                    await Files.delete(recipe.imageUrl);
                }

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
            publicRecipesList: null,
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

    private async initializeRemoteCookbook(cookbook: SolidContainerModel): Promise<void> {
        await this.migrateLocalRecipes(cookbook.url);

        setRemoteCollection(Recipe, cookbook.url);

        if (cookbook.url !== this.remoteCookbookUrl)
            this.setState({ remoteCookbookUrl: cookbook.url });

        this.cookbook.resolve(cookbook);
    }

    private async loadRecipes(): Promise<void> {
        const recipes = await Recipe.all();

        this.allRecipes = arr(recipes);
    }

    private async loadCookbook(): Promise<void> {
        if (Auth.isLoggedIn()) {
            const engine = Auth.authenticator.engine;
            const cookbook = await SolidContainerModel.withEngine(engine, async () => tap(
                await this.findCookbook(),
                cookbook => cookbook && this.initializeRemoteCookbook(cookbook),
            ));

            cookbook && this.cookbook.resolve(cookbook);

            return;
        }

        Recipe.collection = this.remoteCookbookUrl ?? this.localCookbookUrl;
        RecipesList.collection = this.remoteCookbookUrl ?? RecipesList.collection;

        this.cookbook.resolve(new SolidContainerModel({ url: Recipe.collection, name: 'cookbook' }));
    }

    private async loadPublicRecipesList(): Promise<RecipesList> {
        this.publicRecipesList = this.publicRecipesList
            ?? await this.findPublicRecipesList()
            ?? this.newPublicRecipesList();

        return this.publicRecipesList;
    }

    private async reloadRecipes(): Promise<void> {
        await this.loadRecipes();
    }

    private async findCookbook(refreshStaleProfile: boolean = true): Promise<SolidContainerModel | null> {
        const user = Auth.requireUser();

        try {
            return await this.findCookbookInTypeIndex(user.privateTypeIndexUrl)
                ?? await this.findCookbookInTypeIndex(user.publicTypeIndexUrl)
                ?? null;
        } catch (error) {
            // TODO check that error was NetworkRequestError
            if (!refreshStaleProfile)
                throw error;

            await Auth.refreshUserProfile();
            await Auth.createPrivateTypeIndex();

            return this.findCookbook(false);
        }
    }

    private async findCookbookInTypeIndex(typeIndexUrl?: string): Promise<SolidContainerModel | null> {
        if (!typeIndexUrl) {
            return null;
        }

        return SolidContainerModel.fromTypeIndex(typeIndexUrl, Recipe);
    }

    private async findPublicRecipesList(): Promise<RecipesList | null> {
        if (!Auth.isLoggedIn()) {
            return null;
        }

        const user = Auth.requireUser();

        if (user.publicTypeIndexUrl) {
            const authenticator = Auth.requireAuthenticator();
            const engine = authenticator.engine;
            const urls = await findInstanceRegistrations(
                user.publicTypeIndexUrl,
                RecipesList.rdfsClasses,
                authenticator.requireAuthenticatedFetch(),
            );

            for (const url of urls) {
                const list = await RecipesList.withEngine(engine, () => RecipesList.find(url));

                if (!list?.isPublic) {
                    continue;
                }

                return list;
            }
        }

        return null;
    }

    private newPublicRecipesList(): RecipesList {
        const user = Auth.requireUser();
        const remoteCookbookUrl = this.remoteCookbookUrl
                ?? fail('Cannot create a recipes list without a remote cookbook');

        return new RecipesList({
            url: `${remoteCookbookUrl}public#it`,
            name: user.name ? `${user.name}'s Public Recipes` : 'Public Recipes',
            creatorWebId: user.webId,
        });
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

    private async registerPublicRecipesList(publicRecipesList: RecipesList): Promise<void> {
        const user = Auth.requireUser();
        const engine = Auth.requireAuthenticator().engine;
        const typeIndexUrl = user.publicTypeIndexUrl ?? await Auth.createPublicTypeIndex();

        await Promise.all(RecipesList.rdfsClasses.map(async rdfsClass => {
            const typeRegistration = new SolidTypeRegistration({
                forClass: rdfsClass,
                instance: publicRecipesList.url,
            });

            typeRegistration.mintUrl(typeIndexUrl, true, uuid());

            await SolidTypeRegistration.withEngine(
                engine,
                () => typeRegistration.save(requireUrlParentDirectory(typeIndexUrl)),
            );
        }));

        await RecipesList.withEngine(
            engine,
            () => publicRecipesList.updatePublicPermissions([SolidDocumentPermission.Read]),
        );

        publicRecipesList.isRegistered = true;
    }

}

export default interface CookbookService extends IService<State, ComputedState> {}
