import { arr } from '@noeldemartin/utils';
import type { FluentArray } from '@noeldemartin/utils';

import Events from '@/framework/core/facades/Events';
import Service from '@/framework/core/Service';
import type { IService } from '@/framework/core/Service';

import Recipe from '@/models/Recipe';
import Auth from '@/framework/core/facades/Auth';

interface State {
    recipes: FluentArray<Recipe> | null;
}

export default class CookbookService extends Service<State> {

    public addRecipe(recipe: Recipe): void {
        this.recipes?.push(recipe);
    }

    public async removeRecipe(recipe: Recipe): Promise<void> {
        this.recipes?.remove(recipe);

        await recipe.delete();
    }

    protected async boot(): Promise<void> {
        await super.boot();

        Events.on('login', () => this.loadRecipes());
        Events.on('logout', async () => {
            if (!this.recipes)
                return;

            await Promise.all(this.recipes.map(recipe => recipe.delete()));

            this.recipes = null;
        });

        if (Auth.loggedIn)
            await this.loadRecipes();
    }

    protected getInitialState(): State {
        return {
            recipes: null,
        };
    }

    private async loadRecipes(): Promise<void> {
        const recipes = await Recipe.all();

        this.recipes = arr(recipes);
    }

}

export default interface CookbookService extends IService<State> {}
