import type { RouteLocationRaw } from 'vue-router';

import type Recipe from '@/models/Recipe';

export default interface RecipesCollection {
    url: string;
    name?: string;
    description?: string;
    creatorWebId?: string;
    recipes?: Recipe[];

    route(): RouteLocationRaw;
}
