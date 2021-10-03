import type Recipe from '@/models/Recipe';

export default {

    createRecipe(name: string): Cypress.Chainable<Recipe> {
        return cy.testingRuntime().then(runtime => runtime.createRecipe(name));
    },

};
