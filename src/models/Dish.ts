import { fail } from '@noeldemartin/utils';

import Cookbook from '@/services/facades/Cookbook';
import type Recipe from '@/models/Recipe';

export interface DishJson {
    recipeId: string;
}

export default class Dish {

    public static async fromJson(json: DishJson): Promise<Dish> {
        await Cookbook.booted;

        const recipe = Cookbook.allRecipes.find(recipe => recipe.id === json.recipeId)
            ?? fail<Recipe>(`Could not find recipe with id '${json.recipeId}' for dish`);

        return new Dish(recipe);
    }

    public readonly recipe: Recipe;

    constructor(recipe: Recipe) {
        this.recipe = recipe;
    }

    public toJson(): DishJson {
        return {
            recipeId: this.recipe.id ,
        };
    }

}
