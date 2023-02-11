import { SolidContainer } from 'soukai-solid';
import type { Relation } from 'soukai';
import type { RouteLocationRaw } from 'vue-router';
import type { SolidContainsRelation } from 'soukai-solid';

import Recipe from '@/models/Recipe';

import type RecipesCollection from './contracts/RecipesCollection';

export default class RecipesContainer extends SolidContainer implements RecipesCollection {

    declare public recipes?: Recipe[];
    declare public relatedRecipes: SolidContainsRelation<this, Recipe, typeof Recipe>;

    public recipesRelationship(): Relation {
        return this.contains(Recipe);
    }

    public route(): RouteLocationRaw {
        return { name: 'viewer', query: { url: this.url } };
    }

}
