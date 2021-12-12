import type Recipe from '@/models/Recipe';

describe('Reactivity', () => {

    beforeEach(() => {
        cy.task('resetSolidPOD');
        cy.visit('/recipes?authenticator=localStorage');
        cy.startApp();
    });

    it('reacts to new local recipes', () => {
        // Act
        cy.createRecipe('Ramen');

        // Assert
        cy.contains('Ramen').should('be.visible');
    });

    it('reacts to new remote recipes', () => {
        // Arrange
        cy.login();
        cy.fixture('ramen.ttl').then(body => cy.request({
            url: 'http://localhost:4000/cookbook/ramen',
            method: 'PUT',
            headers: { 'Content-Type': 'text/turtle' },
            body,
        }));

        // Act
        cy.contains('Syncing is up to date');

        // Assert
        cy.contains('Ramen').should('be.visible');
    });

    it.skip('reacts to local recipe updates in recipes list', () => {
        // Arrange
        let ramen: Recipe;

        cy.createRecipe('Ramen').then(_ramen => ramen = _ramen);

        // Act
        cy.contains('Ramen').should('be.visible').then(() => {
            return Cypress.Promise.cast(ramen.update({ name: 'Ramen!' }));
        });

        // Assert
        cy.contains('Ramen!').should('be.visible');
    });

    it('reacts to local recipe updates in recipe details', () => {
        // Arrange
        let ramen: Recipe;

        cy.createRecipe('Ramen').then(_ramen => ramen = _ramen);
        cy.contains('Ramen').click();

        // Act
        cy.url().should('include', 'ramen').then(() => {
            ramen.description = 'is life';
            ramen.relatedInstructions.attach({ position: 1, text: 'Boil the noodles' });

            return Cypress.Promise.cast(ramen.save());
        });

        // Assert
        cy.contains('is life').should('be.visible');
        cy.contains('Boil the noodles').should('be.visible');
    });

});
