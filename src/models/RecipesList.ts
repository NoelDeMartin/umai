import type { Relation } from 'soukai';
import type { RouteLocationRaw } from 'vue-router';
import type { SolidBelongsToManyRelation } from 'soukai-solid';

import Model from './RecipesList.schema';
import RecipesListItem from './RecipesListItem';
import type Recipe from './Recipe';

export default class RecipesList extends Model {

    public static history = false;
    public static timestamps = false;
    public static rdfContexts = {
        schema: 'https://schema.org/',
        purl: 'http://purl.org/dc/terms/',
    };

    public static rdfsClasses = ['schema:ItemList'];

    public isRegistered = false;
    declare public items?: RecipesListItem[];
    declare public relatedItems: SolidBelongsToManyRelation<
        this,
        RecipesListItem,
        typeof RecipesListItem
    >;

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
