import { PromisedValue, arr, fail, tap } from '@noeldemartin/utils';
import { SolidContainerModel, SolidEngine } from 'soukai-solid';
import type { FluentArray } from '@noeldemartin/utils';

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

        Events.on('logout', () => {
            // TODO upon logging out, local recipes must be updated with a local url (or maybe deleted!)
            Recipe.collection = this.localCookbookUrl;

            this.setState({
                remoteCookbookUrl: null,
                cookbook: new PromisedValue,
            });
        });
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
            const engine = new SolidEngine(Auth.authenticator.requireAuthenticatedFetch());

            return SolidContainerModel.withEngine(engine, async () => tap(
                await this.findCookbook() ?? await this.createCookbook(),
                cookbook => {
                    setRemoteCollection(Recipe, cookbook.url);

                    if (cookbook.url !== this.remoteCookbookUrl)
                        this.setState({ remoteCookbookUrl: cookbook.url });
                },
            ));
        }

        Recipe.collection = this.remoteCookbookUrl ?? this.localCookbookUrl;

        return new SolidContainerModel({ url: Recipe.collection, name: 'cookbook' });
    }

    private async findCookbook(): Promise<SolidContainerModel | null> {
        const user = Auth.requireUser();

        return user.privateTypeIndexUrl
            ? await SolidContainerModel.fromTypeIndex(user.privateTypeIndexUrl, Recipe)
            : null;
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

}

export default interface CookbookService extends IService<State> {}
