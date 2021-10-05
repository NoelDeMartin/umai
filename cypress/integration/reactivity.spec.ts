import type Recipe from '@/models/Recipe';

describe('Reactivity', () => {

    beforeEach(() => {
        cy.task('resetSolidPOD');
        cy.visit('/?authenticator=localStorage');
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
        cy.get('[aria-label="Sync"]').click();
        cy.get('.animate-spin').should('not.exist');

        // Assert
        cy.contains('Ramen').should('be.visible');
    });

    it('reacts to local recipe updates', () => {
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
