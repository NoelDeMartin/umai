describe('Github issues', () => {

    beforeEach(() => {
        cy.visit('/');
        cy.startApp();
    });

    it('#13 Image Upload Button is blocked by long title on mobile', () => {
        // Arrange
        cy.viewport('samsung-s10');

        cy.press('Create your first recipe');
        cy.press('Create from scratch');
        cy.ariaInput('Recipe name').type(
            'This is a long recipe title as it often occurs on recipes imported from the web',
        );

        // Act
        cy.press('Add an image');

        // Assert
        cy.see('Change recipe image');
    });

});
