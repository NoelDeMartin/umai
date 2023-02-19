import ramenJsonLD from '@cy/fixtures/recipes/ramen-3.json';
import { cssPodUrl } from '@cy/support/commands/auth';

describe('Authentication', () => {

    it('Logs in using the localStorage authenticator', () => {
        // Arrange
        cy.intercept('https://alice.example.com', { statusCode: 404 });
        cy.intercept('https://alice.example.com/profile/card', { fixture: 'turtle/profile.ttl' });
        cy.task('resetSolidPOD');
        cy.visit('/?authenticator=localStorage');
        cy.startApp();

        // Act
        cy.press('Connect your Solid POD');
        cy.ariaInput('Login url').type('alice.example.com{enter}');
        cy.waitForReload();

        // Assert
        cy.press('online');
        cy.see('You are logged in as John Doe');
    });

    it('Signs up using the Inrupt authenticator', () => {
        // Arrange
        const registerCookbookReplacements = {
            resourceHash: '[[cookbook-registration][.*]]',
            cookbookUrl: cssPodUrl('/alice/cookbook/'),
        };

        cy.intercept('PUT', cssPodUrl('/alice/cookbook/')).as('createCookbook');
        cy.intercept('PUT', cssPodUrl('/alice/settings/privateTypeIndex')).as('createTypeIndex');
        cy.intercept('PATCH', cssPodUrl('/alice/settings/privateTypeIndex')).as('registerCookbook');
        cy.intercept('PATCH', cssPodUrl('/alice/cookbook/ramen')).as('patchRamen');
        cy.visit('/?authenticator=inrupt');
        cy.startApp();

        // Act - Sign up
        cy.press('Connect your Solid POD');
        cy.ariaInput('Login url').clear().type(cssPodUrl('/alice/{enter}'));
        cy.cssAuthorize({ reset: true });
        cy.waitForReload({ resetProfiles: true });

        // Act - Create cookbook
        cy.press('Continue');

        // Act - Create recipe
        cy.goOffline();
        cy.press('Create from scratch');
        cy.ariaInput('Recipe name').type('Ramen');
        cy.press('Create recipe');
        cy.see('There is one pending update');
        cy.comeBackOnline();

        // Assert
        cy.press('online');
        cy.see(`You are logged in as ${cssPodUrl('/alice/profile/card#me')}`);

        cy.get('@createCookbook').its('request.headers.authorization').should('match', /DPoP .*/);
        cy.get('@createTypeIndex').its('request.headers.authorization').should('match', /DPoP .*/);
        cy.get('@registerCookbook').its('request.headers.authorization').should('match', /DPoP .*/);
        cy.get('@patchRamen').its('request.headers.authorization').should('match', /DPoP .*/);
        cy.get('@patchRamen').its('request.headers.if-none-match').should('equal', '*');

        cy.fixtureWithReplacements('sparql/register-cookbook.sparql', registerCookbookReplacements).then(sparql => {
            cy.get('@registerCookbook').its('request.body').should('be.sparql', sparql);
        });
    });

    it('Logs in using the Inrupt authenticator', () => {
        // Arrange
        cy.intercept('PATCH', cssPodUrl('/alice/cookbook/pisto')).as('patchPisto');
        cy.visit('/?authenticator=inrupt');
        cy.startApp();

        // Act - Log in
        cy.press('Connect your Solid POD');
        cy.ariaInput('Login url').clear().type(cssPodUrl('/alice/{enter}'));
        cy.cssAuthorize({
            reset: {
                typeIndex: true,
                cookbook: true,
                recipe: 'pisto',
            },
        });
        cy.waitForReload({ resetProfiles: true });

        // Act - Update recipe
        cy.goOffline();
        cy.press('Pisto');
        cy.press('Edit');
        cy.ariaInput('Recipe name').type('!');
        cy.press('Save');
        cy.see('There is one pending update');
        cy.comeBackOnline();

        // Assert
        cy.see('Pisto!');

        cy.get('@patchPisto').its('request.headers.authorization').should('match', /DPoP .*/);
        cy.get('@patchPisto').its('request.headers.if-none-match').should('not.exist');
    });

    it('Refreshes stale cached profiles', () => {
        // Arrange
        cy.visit('/?authenticator=inrupt');
        cy.startApp();
        cy.press('Connect your Solid POD');
        cy.ariaInput('Login url').clear().type(cssPodUrl('/alice/{enter}'));
        cy.cssAuthorize({ reset: true });
        cy.waitForReload({ resetProfiles: true });
        cy.press('online');
        cy.contains('[role="dialog"]', 'You are logged in').within(() => {
            cy.toggleDetails('Advanced options');
        });
        cy.press('Reconnect on startup');
        cy.reload();

        // Act
        cy.press('disconnected');
        cy.press('Reconnect', 'button');
        cy.press('Authorize');
        cy.cssReset();
        cy.waitForReload();

        // Assert
        cy.press('online');
        cy.see('You are logged in');
    });

    it('Wipes local data on log out', () => {
        // Arrange
        cy.visit('/?authenticator=inrupt');
        cy.startApp();
        cy.press('Connect your Solid POD');
        cy.ariaInput('Login url').clear().type(cssPodUrl('/alice/{enter}'));
        cy.cssAuthorize({
            reset: {
                typeIndex: true,
                cookbook: true,
                recipe: 'pisto',
            },
        });
        cy.waitForReload({ resetProfiles: true });
        cy.see('Pisto');

        // Act
        cy.press('online');
        cy.press('Log out');
        cy.see('Are you sure?');
        cy.press('Log out');

        // Assert
        cy.see('How would you like to begin?');
    });

    it('Logs out while disconnected', () => {
        // Arrange
        cy.visit('/?authenticator=inrupt');
        cy.startApp();
        cy.press('Connect your Solid POD');
        cy.ariaInput('Login url').clear().type(cssPodUrl('/alice/{enter}'));
        cy.cssAuthorize({
            reset: {
                typeIndex: true,
                cookbook: true,
                recipe: 'pisto',
            },
        });
        cy.waitForReload({ resetProfiles: true });
        cy.see('Pisto');
        cy.press('online');
        cy.toggleDetails('Advanced options');
        cy.press('Reconnect on startup');
        cy.reload();

        // Act
        cy.press('disconnected');
        cy.press('Log out');
        cy.contains('[role="dialog"]', 'Are you sure?').within(() => {
            cy.press('Log out');
        });

        // Assert
        cy.see('How would you like to begin?');
        cy.dontSee('Connect to cloud');
    });

    it('Migrates local data to cloud after logging in', () => {
        // Arrange
        cy.intercept('PATCH', cssPodUrl('/alice/cookbook/ramen')).as('patchRamen');
        cy.visit('/');
        cy.startApp();

        // Act - Create
        cy.press('Create your first recipe');
        cy.press('Create from scratch');
        cy.ariaInput('Recipe name').type('Ramen');
        cy.press('Add ingredient');
        cy.currentElement().type('Broth{enter}');
        cy.currentElement().type('Noodles');
        cy.press('Create recipe');
        cy.see('New recipe');

        // Act - First edit
        cy.press('Ramen');
        cy.press('Edit');
        cy.ariaInput('Recipe name').type('!');
        cy.press('Write a description');
        cy.currentElement().type('is life');
        cy.press('Add ingredient');
        cy.currentElement().type('Toppings');
        cy.press('Add instructions');
        cy.currentElement().type('Boil the noodles{enter}');
        cy.currentElement().type('Dip them into the broth');
        cy.press('Save');
        cy.url().should('contain', 'ramen');
        cy.url().should('not.contain', 'edit');

        // Act - Second edit
        cy.press('Edit');
        cy.ariaInput('Recipe name').clear().type('Jun\'s Ramen');
        cy.ariaInput('Recipe description').clear().type('Instructions: https://www.youtube.com/watch?v=9WXIrnWsaCo');
        cy.ariaInput('Recipe ingredient #3').click();
        cy.currentElement().clear().type('Shiitake{enter}');
        cy.currentElement().type('Nori');
        cy.ariaInput('Recipe instructions step #2').click();
        cy.currentElement().type('!{enter}');
        cy.currentElement().type('Add toppings');
        cy.press('Save');
        cy.url().should('contain', 'ramen');
        cy.url().should('not.contain', 'edit');

        // Act - Third edit
        cy.press('Edit');
        cy.ariaInput('Recipe instructions step #3').click();
        cy.currentElement().tab();
        cy.currentElement().click();
        cy.get('label:contains("Recipe instructions step")').should('have.length', 2);
        cy.press('Save');
        cy.url().should('contain', 'ramen');
        cy.url().should('not.contain', 'edit');

        // Act - Connect with cloud
        cy.visit('/?authenticator=inrupt');
        cy.startApp();
        cy.press('disconnected');
        cy.ariaInput('Login url').clear().type(cssPodUrl('/alice/{enter}'));
        cy.cssAuthorize({ reset: true });
        cy.waitForReload({ resetProfiles: true });
        cy.press('Continue');

        // Assert
        cy.wait('@patchRamen');
        cy.get('@patchRamen.all').should('have.length', 1);
        cy.assertLocalDocumentEquals(cssPodUrl('/alice/cookbook/ramen'), ramenJsonLD);
        cy.assertLocalDocumentDoesNotExist('solid://recipes/ramen');
    });

    it('Restores route after reconnecting', () => {
        // Arrange
        cy.intercept('PATCH', cssPodUrl('/alice/cookbook/pisto')).as('patchPisto');
        cy.visit('/?authenticator=inrupt');
        cy.startApp();

        cy.press('Connect your Solid POD');
        cy.ariaInput('Login url').clear().type(cssPodUrl('/alice/{enter}'));
        cy.cssAuthorize({
            reset: {
                typeIndex: true,
                cookbook: true,
                recipe: 'pisto',
            },
        });
        cy.waitForReload({ resetProfiles: true });
        cy.see('Pisto');

        // Act
        cy.visit('/recipes/pisto?arbitraryState=true#hash');
        cy.startApp();

        // Assert
        cy.url().should('equal', `${Cypress.config('baseUrl')}/recipes/pisto?arbitraryState=true#hash`);
    });

});
