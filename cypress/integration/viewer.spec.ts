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

});
