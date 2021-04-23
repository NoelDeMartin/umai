import { arr } from '@noeldemartin/utils';
import type { FluentArray } from '@noeldemartin/utils';

import Service from '@/framework/core/Service';
import type { IService } from '@/framework/core/Service';

import Recipe from '@/models/Recipe';

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
