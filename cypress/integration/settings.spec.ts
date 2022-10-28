describe('Settings', () => {

    beforeEach(() => {
        cy.task('resetSolidPOD');
        cy.visit('/recipes?authenticator=localStorage');
        cy.startApp();
    });

    it('Changes language', () => {
        // Arrange
        cy.createRecipe({ name: 'Ramen' });

        // Act
        cy.ariaLabel('Open user menu').click();
        cy.press('Settings');
        cy.ariaSelect('Language').select('Català');
        cy.ariaLabel('Close modal').click();

        // Assert
        cy.see('Nova recepta');
    });

});
