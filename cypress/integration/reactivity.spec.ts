import type Recipe from '@/models/Recipe';

describe('Reactivity', () => {

    beforeEach(() => {
        cy.task('resetSolidPOD');
        cy.visit('/recipes?authenticator=localStorage');
        cy.startApp();
    });

    it('Reacts to new local recipes', () => {
        // Act
        cy.createRecipe({ name: 'Ramen' });

        // Assert
        cy.see('Ramen');
    });

    it('Reacts to new remote recipes', () => {
        // Arrange
        cy.login();
        cy.createSolidDocument('/cookbook/ramen', 'recipes/ramen.ttl');

        // Act
        cy.sync();

        // Assert
        cy.see('Ramen');
    });

    it('Reacts to local recipe updates in recipes list', () => {
        // Arrange
        let ramen: Recipe;

        cy.createRecipe({ name: 'Ramen' }).then(_ramen => ramen = _ramen);

        // Act
        cy.see('Ramen').then(() => {
            return Cypress.Promise.cast(ramen.update({ name: 'Ramen!' }));
        });

        // Assert
        cy.see('Ramen!');
    });

    it('Reacts to local recipe updates in recipe details', () => {
        // Arrange
        let ramen: Recipe;

        cy.createRecipe({ name: 'Ramen' }).then(_ramen => ramen = _ramen);
        cy.press('Ramen');

        // Act
        cy.url().should('include', 'ramen').then(() => {
            ramen.description = 'is life';
            ramen.relatedInstructions.attach({ position: 1, text: 'Boil the noodles' });

            return Cypress.Promise.cast(ramen.save());
        });

        // Assert
        cy.see('is life');
        cy.see('Boil the noodles');
    });

});
