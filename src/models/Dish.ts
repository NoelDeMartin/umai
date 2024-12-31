import { fail } from '@noeldemartin/utils';
import type { RouteLocationRaw } from 'vue-router';

import Cookbook from '@/services/facades/Cookbook';
import ListenersManager from '@/utils/ListenersManager';
import type Recipe from '@/models/Recipe';
import type { Listeners } from '@/utils/ListenersManager';

export type KitchenStage = number | 'ingredients' | 'completed';

export interface DishListener {
    onUpdated(): void;
}

export interface DishJson {
    recipeId: string;
    stage: KitchenStage;
    ingredients: Record<string, boolean>;
}

export default class Dish {

    public static async fromJson(json: DishJson): Promise<Dish> {
        await Cookbook.booted;

        const recipe = Cookbook.allRecipes.find(recipe => recipe.id === json.recipeId)
            ?? fail<Recipe>(`Could not find recipe with id '${json.recipeId}' for dish`);

        return new Dish(recipe, {
            stage: json.stage,
            ingredients: json.ingredients,
        });
    }

    public readonly recipe: Recipe;
    private _listeners = new ListenersManager<DishListener>();
    private _stage: KitchenStage;
    private _ingredients: Record<string, boolean>;

    constructor(recipe: Recipe, state: { stage?: KitchenStage; ingredients?: Record<string, boolean> } = {}) {
        this.recipe = recipe;
        this._stage = state.stage ?? 'ingredients';
        this._ingredients = state.ingredients ?? recipe.ingredients.reduce((ingredients, ingredient) => {
            ingredients[ingredient] = false;

            return ingredients;
        }, {} as Record<string, boolean>);
    }

    public get listeners(): Listeners<DishListener> {
        return this._listeners;
    }

    public get stage(): KitchenStage {
        return this._stage;
    }

    public get ingredients(): Record<string, boolean> {
        return this._ingredients;
    }

    public getStageRoute(): RouteLocationRaw {
        if (this.stage === 'ingredients') {
            return {
                name: 'kitchen.ingredients',
                params: { recipe: this.recipe.slug },
            };
        }

        if (this.stage === 'completed') {
            return {
                name: 'kitchen.completed',
                params: { recipe: this.recipe.slug },
            };
        }

        return {
            name: 'kitchen.instructions',
            params: {
                recipe: this.recipe.slug,
                step: this.stage,
            },
        };
    }

    public updateStage(value: KitchenStage): void {
        this._stage = value;

        this._listeners.emit('onUpdated');
    }

    public updateIngredient(ingredient: string, checked: boolean): void {
        this._ingredients[ingredient] = checked;

        this._listeners.emit('onUpdated');
    }

    public toJson(): DishJson {
        return {
            recipeId: this.recipe.id,
            stage: this.stage,
            ingredients: this.ingredients,
        };
    }

}
