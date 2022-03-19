import type { Attributes } from 'soukai';

import type Recipe from '@/models/Recipe';

export default {

    createRecipe(attributes: Attributes): Cypress.Chainable<Recipe> {
        return cy.testingRuntime().then(runtime => runtime.createRecipe(attributes));
    },

};
