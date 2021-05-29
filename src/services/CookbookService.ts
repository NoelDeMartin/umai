import { arr } from '@noeldemartin/utils';
import type { FluentArray } from '@noeldemartin/utils';

import Auth from '@/framework/core/facades/Auth';
import Events from '@/framework/core/facades/Events';
import Service from '@/framework/core/Service';
import type { IService } from '@/framework/core/Service';

import Recipe from '@/models/Recipe';

interface State {
    recipes: FluentArray<Recipe>;
}

export default class CookbookService extends Service<State> {

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
        await this.loadRecipes();

        const defaultCollectionName = Recipe.collection;

        Events.on('login', user => {
            // TODO read from type index instead
            // TODO upon logging in, local recipes must be updated with a remote url
            Recipe.collection = `${user.storageUrl}cookbook/`;
        });

        Events.on('logout', () => {
            // TODO upon logging out, local recipes must be updated with a local url (or maybe deleted!)
            Recipe.collection = defaultCollectionName;
        });
    }

    protected getInitialState(): State {
        return {
            recipes: arr<Recipe>([]),
        };
    }

    private async loadRecipes(): Promise<void> {
        const recipes = Auth.isLoggedIn()
            // TODO read from type index instead
            ? await Recipe.from(`${Auth.user.storageUrl}cookbook/`).all()
            : await Recipe.all();

        this.recipes = arr(recipes);
    }

}

export default interface CookbookService extends IService<State> {}
