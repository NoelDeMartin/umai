import { PromisedValue, arr, fail, isObject, tap } from '@noeldemartin/utils';
import { SolidContainerModel } from 'soukai-solid';
import type { FluentArray, Obj } from '@noeldemartin/utils';

import Auth from '@/framework/core/facades/Auth';
import Events from '@/framework/core/facades/Events';
import Service from '@/framework/core/Service';
import { setRemoteCollection } from '@/framework/cloud/remote_helpers';
import type { IService } from '@/framework/core/Service';

import Recipe from '@/models/Recipe';

interface State {
    localCookbookUrl: string;
    remoteCookbookUrl: string | null;
    cookbook: PromisedValue<SolidContainerModel>;
    recipes: FluentArray<Recipe>;
}

export default class CookbookService extends Service<State> {

    public static persist: Array<keyof State> = ['remoteCookbookUrl'];

    public addRecipe(recipe: Recipe): void {
        this.recipes.push(recipe);
    }

    public async removeRecipe(recipe: Recipe): Promise<void> {
        this.recipes.remove(recipe);

        await recipe.delete();
    }

    protected async boot(): Promise<void> {
        await super.boot();
        await Auth.ready;
        await this.loadCookbook();
        await this.loadRecipes();

        Events.on('login', async () => {
            // TODO this should be refactored, because technically the cookbook is already loaded (it's just the local
            // one, not the remote, that's why this works now). Instead we should migrate both the local cookbook and
            // the recipes to match the remote declarations.
            await this.loadCookbook();
        });

        Events.on('logout', async () => {
            Recipe.collection = this.localCookbookUrl;

            await Promise.all(this.recipes.map(recipe => recipe.delete()));

            this.setState({
                remoteCookbookUrl: null,
                cookbook: new PromisedValue,
                recipes: arr<Recipe>(),
            });
        });

        Recipe.on('created', recipe => this.addRecipe(recipe));

        // TODO investigate a different way to work around reactivity issues
        Recipe.on('updated', () => this.setState({ recipes: this.recipes.slice(0) }));
    }

    protected getInitialState(): State {
        return {
            localCookbookUrl: Recipe.collection,
            remoteCookbookUrl: null,
            cookbook: new PromisedValue,
            recipes: arr<Recipe>([]),
        };
    }

    private async loadRecipes(): Promise<void> {
        const recipes = await Recipe.all();

        this.recipes = arr(recipes);
    }

    private async loadCookbook(): Promise<void> {
        const cookbook = await this.resolveCookbook();

        this.cookbook.resolve(cookbook);
    }

    private async resolveCookbook(): Promise<SolidContainerModel> {
        if (Auth.isLoggedIn()) {
            const engine = Auth.authenticator.newEngine();

            return SolidContainerModel.withEngine(engine, async () => tap(
                await this.findCookbook() ?? await this.createCookbook(),
                async cookbook => {
                    await this.migrateLocalRecipes(cookbook.url);

                    setRemoteCollection(Recipe, cookbook.url);

                    if (cookbook.url !== this.remoteCookbookUrl)
                        this.setState({ remoteCookbookUrl: cookbook.url });
                },
            ));
        }

        Recipe.collection = this.remoteCookbookUrl ?? this.localCookbookUrl;

        return new SolidContainerModel({ url: Recipe.collection, name: 'cookbook' });
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

    private async createCookbook(): Promise<SolidContainerModel> {
        const user = Auth.requireUser();
        const name = prompt('We need to create a new Cookbook, how do you want to call it?', 'Cookbook') ?? fail();
        const storageUrl = prompt('Where would you like to store it?', user.storageUrls[0] ?? '') || fail<string>();

        return tap(new SolidContainerModel({ name }), async container => {
            await container.save(storageUrl);

            const typeIndexUrl = user.privateTypeIndexUrl ?? await Auth.createPrivateTypeIndex();

            await container.register(typeIndexUrl, Recipe);
        });
    }

    private async migrateLocalRecipes(remoteCollection: string): Promise<void> {
        const recipes = await Recipe.all();
        const engine = Recipe.requireEngine();
        const migrateLocalUrls = (document: Obj) => {
            for (const [field, value] of Object.entries(document)) {
                if (field === '@id' && typeof value === 'string' && value.startsWith(Recipe.collection))
                    document[field] = value.replace(Recipe.collection, remoteCollection);
                else if (isObject(value))
                    migrateLocalUrls(value);
            }
        };

        for (const recipe of recipes) {
            if (recipe.url.startsWith(remoteCollection))
                continue;

            const documentUrl = recipe.requireDocumentUrl();
            const document = await engine.readOne(Recipe.collection, documentUrl);

            migrateLocalUrls(document);

            await engine.create(remoteCollection, document, documentUrl.replace(Recipe.collection, remoteCollection));
            await engine.delete(Recipe.collection, documentUrl);
        }
    }

}

export default interface CookbookService extends IService<State> {}
