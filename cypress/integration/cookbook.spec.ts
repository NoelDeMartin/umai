describe('Cookbook', () => {

    beforeEach(() => {
        indexedDB.deleteDatabase('soukai');
        indexedDB.deleteDatabase('soukai-meta');

        cy.visit('/');
    });

    it('creates recipes', () => {
        // Arrange
        cy.contains('No recipes yet!').should('be.visible');

        // Act
        cy.contains('New Recipe').click();
        cy.get('#name').type('Ramen');
        cy.contains('Create').click();

        // Assert
        cy.contains('Ramen').should('be.visible');
        cy.contains('No description').should('be.visible');
    });

});
