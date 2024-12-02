import { createACLSparql, cssPodUrl, publishACLSparql } from '@cy/support/commands/auth';

describe('Github issues', () => {

    beforeEach(() => {
        cy.visit('/');
        cy.startApp();
    });

    it('#9  Updated images don\'t use recipe permissions', () => {
        // Arrange
        cy.intercept('PATCH', cssPodUrl('/alice/cookbook/ramen.png.acl')).as('patchImageACL');

        cy.visit('/?authenticator=inrupt');
        cy.startApp();
        cy.createRecipe({ name: 'Ramen' });
        cy.login({ authenticator: 'inrupt', hasCookbook: true });
        cy.press('Ramen');
        cy.press('Share');
        cy.see('Private', 'button');
        cy.see('This recipe is private');
        cy.press('Private', 'button');
        cy.press('Public', 'li');
        cy.see('updating permissions');
        cy.see('Public', 'button', { timeout: 10000 });
        cy.ariaLabel('Close modal').click();

        // Act
        cy.press('Edit');
        cy.ariaLabel('Add an image').focus();
        cy.press('Add an image');
        cy.uploadFixture('Upload an image', 'img/ramen.png');
        cy.see('Remove image');
        cy.press('Update');
        cy.press('Save');
        cy.waitForSync();

        // Assert
        cy.get('@patchImageACL.all').should('have.length', 2);
        cy.get('@patchImageACL.0').its('request.body').should('be.sparql', createACLSparql('ramen.png'));
        cy.get('@patchImageACL.1').its('request.body').should('be.sparql', publishACLSparql('ramen.png'));
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

    it('#15 Add multiple ingredients at once', () => {
        // Arrange
        cy.press('Create your first recipe');
        cy.press('Create from scratch');
        cy.ariaInput('Recipe name').type('Ayran');
        cy.press('Add ingredients');

        // Act
        cy.get(':focus').then(element => {
            const input = element.get(0);
            const event = new ClipboardEvent('paste', { clipboardData: new DataTransfer() });

            event.clipboardData?.setData('text', `
                - 300ml Cold Water
                - 300ml Greek Yogurt
                - Salt
            `);

            input.dispatchEvent(event);
        });
        cy.press('Create recipe');
        cy.press('Ayran');

        // Assert
        cy.contains('ul li:nth-child(1)', '300ml Cold Water');
        cy.contains('ul li:nth-child(2)', '300ml Greek Yogurt');
        cy.contains('ul li:nth-child(3)', 'Salt');
    });

    it('#17 Decodes html entities when importing from the web', () => {
        // Arrange
        cy.intercept('https://recipes.example.com/zurcher', { fixture: 'html/zurcher-geschnetzeltes.html' });

        cy.see('How would you like to begin?');

        // Act - Preview
        cy.press('Create your first recipe');
        cy.press('Import from the Web');
        cy.toggleDetails('Advanced options');
        cy.details('Advanced options').within(() => {
            cy.get('input[type="checkbox"]').click();
        });
        cy.ariaInput('Website url').type('https://recipes.example.com/zurcher');
        cy.press('Scan');
        cy.see('We\'ve found the recipe!');

        // Workaround for https://github.com/cypress-io/cypress/issues/7306
        cy.wait(200);

        // Assert - Preview
        cy.see('Zürcher Geschnetzeltes');
        cy.see('Make and share this Zürcher Geschnetzeltes');

        // Act - Create
        cy.press('Import to my cookbook');
        cy.press('Create recipe');
        cy.dontSee('Create recipe');

        cy.press('Zürcher Geschnetzeltes');

        // Assert - Create
        cy.see('Zürcher Geschnetzeltes');
        cy.see('Make and share this Zürcher Geschnetzeltes');
        cy.see('pepper and ½ teaspoon paprika');
    });

});
