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
        cy.fixture('ramen.ttl').then(body => cy.request({
            url: 'http://localhost:4000/cookbook/ramen',
            method: 'PUT',
            headers: { 'Content-Type': 'text/turtle' },
            body,
        }));

        // Act
        cy.press('online');
        cy.press('Synchronize now');
        cy.see('Syncing is up to date');

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
