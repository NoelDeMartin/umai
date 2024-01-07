import { cssPodUrl } from '@cy/support/commands/auth';

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

    it('#14 "Back to cookbook" navigates to authorization page', () => {
        // Arrange
        cy.visit('/?authenticator=inrupt');
        cy.startApp();
        cy.press('Connect your Solid POD');
        cy.ariaInput('Login url').clear().type(cssPodUrl('/alice/{enter}'));
        cy.cssAuthorize({
            reset: {
                typeIndex: true,
                cookbook: true,
                recipe: 'ramen',
            },
        });
        cy.waitForReload({ resetProfiles: true });
        cy.press('Ramen');
        cy.see('Broth');
        cy.reload();

        // Act
        cy.press('back to cookbook');

        // Assert
        cy.url().should('equal', `${Cypress.config('baseUrl')}/`);
    });

});
