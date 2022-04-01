import { fail } from '@noeldemartin/utils';
import type { Attributes } from 'soukai';

import type Recipe from '@/models/Recipe';

export default {

    createRecipe(attributes: Attributes): Cypress.Chainable<Recipe> {
        return cy.testingRuntime().then(runtime => runtime.createRecipe(attributes));
    },

    getRecipe(uuid: string): Cypress.Chainable<Recipe> {
        return cy.testingRuntime().then(runtime => {
            const recipe = runtime.getRecipe(uuid);

            recipe || fail(`Couldn't find recipe with '${uuid}' uuid`);

            return Promise.resolve(recipe as Recipe);
        });
    },

};
