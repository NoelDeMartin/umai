import aguachileJsonLD from '@cy/fixtures/recipes/aguachile.json';

describe('Viewer', () => {

    it('Views public recipes', () => {
        // Arrange
        cy.intercept('https://example.org/recipes/aguachile', { fixture: 'recipes/aguachile.ttl' });

        // Act
        cy.visit('viewer?url=https://example.org/recipes/aguachile');
        cy.startApp();

        // Assert
        cy.see('Aguachile');
        cy.see('Aguachile ("chile water" in Spanish) is a Mexican dish');
        cy.see('Jalapeños');
        cy.see('Start by peeling the shrimps into a bowl');
    });

    it('Views public recipes using the form', () => {
        // Arrange
        cy.intercept('https://example.org/recipes/aguachile', { fixture: 'recipes/aguachile.ttl' });

        // Act
        cy.visit('viewer');
        cy.startApp();
        cy.ariaInput('Solid document URL').type('https://example.org/recipes/aguachile');
        cy.press('View');

        // Assert
        cy.see('Aguachile');
        cy.see('Aguachile ("chile water" in Spanish) is a Mexican dish');
        cy.see('Jalapeños');
        cy.see('Start by peeling the shrimps into a bowl');
    });

    it('Views all public recipes', () => {
        // Arrange
        cy.intercept('https://example.org/alice/profile/card', { fixture: 'webids/alice.ttl' });
        cy.intercept('https://example.org/recipes/ramen', { fixture: 'recipes/ramen.ttl' });
        cy.intercept('https://example.org/recipes/pisto', { fixture: 'recipes/pisto.ttl' });
        cy.intercept('https://example.org/recipes/public', { fixture: 'recipes/public.ttl' });

        cy.visit('viewer?url=https://example.org/recipes/ramen');
        cy.startApp();

        // Act
        cy.see('Recipe created by Alice');
        cy.press('View all their recipes');
        cy.press('Pisto');

        // Assert
        cy.see('Pisto is the same as Ratatouille!');
    });

    it('Saves recipes in cookbook', () => {
        // Arrange
        cy.intercept('https://example.org/recipes/aguachile', { fixture: 'recipes/aguachile.ttl' });
        cy.visit('viewer?url=https://example.org/recipes/aguachile');
        cy.startApp();

        // Act
        cy.press('Save in cookbook');

        // Assert
        cy.assertLocalDocumentEquals('solid://recipes/aguachile', aguachileJsonLD);
    });

});
