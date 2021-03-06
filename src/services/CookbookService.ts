import { PromisedValue, arr, fail, tap } from '@noeldemartin/utils';
import { SolidContainerModel, SolidEngine } from 'soukai-solid';
import type { FluentArray } from '@noeldemartin/utils';
import type { SolidUserProfile } from '@noeldemartin/solid-utils';

import Auth from '@/framework/core/facades/Auth';
import Events from '@/framework/core/facades/Events';
import Service from '@/framework/core/Service';
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
            await this.loadCookbook();

            // TODO upon logging in, local recipes must be updated with a remote url and uploaded to the cookbook
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
        if (Auth.user && Auth.authenticator) {
            const { user, authenticator } = Auth;
            const engine = new SolidEngine(authenticator.fetch.bind(authenticator));

            return SolidContainerModel.withEngine(engine, async () => tap(
                await this.findCookbook(user) ?? await this.createCookbook(user),
                cookbook => {
                    Recipe.collection = cookbook.url;

                    if (cookbook.url !== this.remoteCookbookUrl)
                        this.setState({ remoteCookbookUrl: cookbook.url });
                },
            ));
        }

        Recipe.collection = this.remoteCookbookUrl ?? this.localCookbookUrl;

        return new SolidContainerModel({ url: Recipe.collection, name: 'cookbook' });
    }

    private findCookbook(user: SolidUserProfile): Promise<SolidContainerModel | null> {
        return SolidContainerModel.fromTypeIndex(user.privateTypeIndexUrl, Recipe);
    }

    private async createCookbook(user: SolidUserProfile): Promise<SolidContainerModel> {
        const name = prompt('We need to create a new Cookbook, how do you want to call it?', 'Cookbook') ?? fail();
        const storageUrl = prompt('Where would you like to store it?', user.storageUrls[0]) ?? fail();

        return tap(new SolidContainerModel({ name }), async container => {
            await container.save(storageUrl);
            await container.register(user.privateTypeIndexUrl, Recipe);
        });
    }

}

export default interface CookbookService extends IService<State> {}
