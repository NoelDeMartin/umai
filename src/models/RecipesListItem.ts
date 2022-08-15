import type { Relation } from 'soukai';
import type { SolidBelongsToOneRelation } from 'soukai-solid';

import Recipe from '@/models/Recipe';

import Model from './RecipesListItem.schema';

export default class RecipesListItem extends Model {

    public static history = false;
    public static timestamps = false;
    public static rdfContexts = { schema: 'https://schema.org/' };
    public static rdfsClasses = ['schema:ListItem'];

    declare public recipe?: Recipe;
    declare public relatedItems: SolidBelongsToOneRelation<
        this,
        Recipe,
        typeof Recipe
    >;

    public recipeRelationship(): Relation {
        return this.belongsToOne(Recipe, 'recipeUrl');
    }

}
