import { fail } from '@noeldemartin/utils';
import type { Attributes } from 'soukai';

import type Recipe from '@/models/Recipe';

export default {

    createRecipe(attributes: Attributes, instructions: string[] = []): Cypress.Chainable<Recipe> {
        return cy.testingRuntime().then(runtime => runtime.createRecipe(attributes, instructions));
    },

    getRecipe(slug: string): Cypress.Chainable<Recipe> {
        return cy.testingRuntime().then(runtime => {
            const recipe = runtime.getRecipe(slug);

            recipe || fail(`Couldn't find recipe with '${slug}' slug`);

            return Promise.resolve(recipe as Recipe);
        });
    },

};
