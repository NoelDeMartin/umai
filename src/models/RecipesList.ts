import { arrayFilter } from '@noeldemartin/utils';
import type { Relation } from 'soukai';
import type { RouteLocationRaw } from 'vue-router';
import type { SolidBelongsToManyRelation } from 'soukai-solid';

import Model from './RecipesList.schema';
import RecipesListItem from './RecipesListItem';
import type Recipe from './Recipe';
import type RecipesCollection from './contracts/RecipesCollection';

export default class RecipesList extends Model implements RecipesCollection {

    public isRegistered = false;
    declare public items?: RecipesListItem[];
    declare public relatedItems: SolidBelongsToManyRelation<
        this,
        RecipesListItem,
        typeof RecipesListItem
    >;

    public get recipes(): Recipe[] | undefined {
        if (!this.isRelationLoaded('items')) {
            return;
        }

        return arrayFilter(this.items?.map(({ recipe }) => recipe) ?? []);
    }

    public itemsRelationship(): Relation {
        return this
            .belongsToMany(RecipesListItem, 'itemUrls')
            .onDelete('cascade')
            .usingSameDocument(true);
    }

    public route(): RouteLocationRaw {
        return { name: 'viewer', query: { url: this.url } };
    }

    public has(recipe: Recipe): boolean {
        return !!this.items?.some(item => item.recipeUrl === recipe.url);
    }

}
