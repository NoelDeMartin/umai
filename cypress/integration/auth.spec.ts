import ramenJsonLD from '@cy/fixtures/ramen-3.json';

describe('Authentication', () => {

    it('Logs in using the localStorage authenticator', () => {
        // Arrange
        cy.intercept('https://alice.example.com', { statusCode: 404 });
        cy.intercept('https://alice.example.com/profile/card', { fixture: 'profile.ttl' });
        cy.task('resetSolidPOD');
        cy.visit('/?authenticator=localStorage');
        cy.startApp();

        // Act
        cy.contains('disconnected').click();
        cy.ariaInput('Login url').type('https://alice.example.com{enter}');
        cy.waitForReload();

        // Assert
        cy.contains('online').click();
        cy.contains('You are logged in as John Doe').should('be.visible');
    });

    it('Signs up using the Inrupt authenticator', () => {
        // Arrange
        cy.intercept('POST', 'http://localhost:4000/alice/').as('createCookbook');
        cy.intercept('PUT', 'http://localhost:4000/alice/settings/privateTypeIndex').as('createTypeIndex');
        cy.intercept('PATCH', 'http://localhost:4000/alice/settings/privateTypeIndex').as('registerCookbook');
        cy.intercept('PATCH', 'http://localhost:4000/alice/cookbook/ramen').as('patchRamen');
        cy.visit('/?authenticator=inrupt');
        cy.startApp();

        // Act - Sign up
        cy.contains('disconnected').click();
        cy.ariaInput('Login url').type('http://localhost:4000/alice/{enter}');
        cy.cssAuthorize({ reset: true });
        cy.waitForReload({ resetProfiles: true });

        // Act - Create cookbook
        cy.contains('Go ahead').click();

        // Act - Create recipe
        cy.contains('Create from scratch').click();
        cy.get('[name="name"]').type('Ramen');
        cy.contains('button', 'Create').click();
        cy.contains('There is one pending update');
        cy.contains('Syncing is up to date');

        // Assert
        cy.contains('online').click();
        cy.contains('You are logged in as http://localhost:4000/alice/profile/card#me').should('be.visible');

        cy.get('@createCookbook').its('request.headers.authorization').should('match', /DPoP .*/);
        cy.get('@createTypeIndex').its('request.headers.authorization').should('match', /DPoP .*/);
        cy.get('@registerCookbook').its('request.headers.authorization').should('match', /DPoP .*/);
        cy.get('@patchRamen').its('request.headers.authorization').should('match', /DPoP .*/);
        cy.get('@patchRamen').its('request.headers.if-none-match').should('equal', '*');
    });

    it('Logs in using the Inrupt authenticator', () => {
        // Arrange
        cy.intercept('PATCH', 'http://localhost:4000/alice/cookbook/pisto').as('patchPisto');
        cy.visit('/?authenticator=inrupt');
        cy.startApp();

        // Act - Log in
        cy.contains('disconnected').click();
        cy.ariaInput('Login url').type('http://localhost:4000/alice/{enter}');
        cy.cssAuthorize({
            reset: {
                typeIndex: true,
                cookbook: true,
                recipe: 'pisto',
            },
        });
        cy.waitForReload({ resetProfiles: true });

        // Act - Update recipe
        cy.contains('Pisto').click();
        cy.contains('Edit').click();
        cy.get('[name="name"]').type('!');
        cy.contains('Save').click();
        cy.contains('There are 2 pending updates');
        cy.contains('Syncing is up to date');

        // Assert
        cy.contains('Pisto!').should('be.visible');

        cy.get('@patchPisto').its('request.headers.authorization').should('match', /DPoP .*/);
        cy.get('@patchPisto').its('request.headers.if-none-match').should('not.exist');
    });

    it('Refreshes stale cached profiles', () => {
        // Arrange
        cy.visit('/?authenticator=inrupt');
        cy.startApp();
        cy.contains('disconnected').click();
        cy.ariaInput('Login url').type('http://localhost:4000/alice/{enter}');
        cy.cssAuthorize({ reset: true });
        cy.waitForReload({ resetProfiles: true });
        cy.contains('online').click();
        cy.contains('You are logged in').should('be.visible');
        cy.contains('Advanced options').click();
        cy.contains('Reconnect on startup').click();
        cy.reload();

        // Act
        cy.contains('disconnected').click();
        cy.contains('Reconnect').click();
        cy.contains('Consent').click();
        cy.cssReset();
        cy.waitForReload();

        // Assert
        cy.contains('online').click();
        cy.contains('You are logged in').should('be.visible');
    });

    it('Wipes local data on log out', () => {
        // Arrange
        cy.visit('/?authenticator=inrupt');
        cy.startApp();
        cy.contains('disconnected').click();
        cy.ariaInput('Login url').type('http://localhost:4000/alice/{enter}');
        cy.cssAuthorize({
            reset: {
                typeIndex: true,
                cookbook: true,
                recipe: 'pisto',
            },
        });
        cy.waitForReload({ resetProfiles: true });
        cy.contains('Pisto').should('be.visible');

        // Act
        cy.contains('online').click();
        cy.contains('Log out').click();

        // Assert
        cy.contains('Are you ready to start cooking?').should('be.visible');
        cy.contains('disconnected').should('be.visible');
    });

    it('Migrates local data to cloud after logging in', () => {
        // Arrange
        cy.intercept('PATCH', 'http://localhost:4000/alice/cookbook/ramen').as('patchRamen');
        cy.visit('/');
        cy.startApp();

        // Act - Create
        cy.contains('Create from scratch').click();
        cy.get('[name="name"]').type('Ramen');
        cy.contains('Add ingredient').click();
        cy.get(':focus').type('Broth{enter}');
        cy.get(':focus').type('Noodles');
        cy.contains('button', 'Create').click();
        cy.url().should('contain', 'ramen');
        cy.url().should('not.contain', 'edit');

        // Act - First edit
        cy.contains('Edit').click();
        cy.get('[name="name"]').type('!');
        cy.get('[name="description"]').type('is life');
        cy.contains('Add ingredient').click();
        cy.get(':focus').type('Toppings');
        cy.contains('Add step').click();
        cy.get(':focus').type('Boil the noodles{enter}');
        cy.get(':focus').type('Dip them into the broth');
        cy.contains('Save').click();
        cy.url().should('contain', 'ramen');
        cy.url().should('not.contain', 'edit');

        // Act - Second edit
        cy.contains('Edit').click();
        cy.get('[name="name"]').clear().type('Jun\'s Ramen');
        cy.get('[name="description"]').clear().type('Instructions: https://www.youtube.com/watch?v=9WXIrnWsaCo');
        cy.get('[name^=ingredient-]').last().click();
        cy.get(':focus').clear().type('Shiitake{enter}');
        cy.get(':focus').type('Nori');
        cy.get('[name^=instruction-step-]').last().click();
        cy.get(':focus').type('!{enter}');
        cy.get(':focus').type('Add Toppings');
        cy.contains('Save').click();
        cy.url().should('contain', 'ramen');
        cy.url().should('not.contain', 'edit');

        // Act - Third edit
        cy.contains('Edit').click();
        cy.get('[name^=instruction-step-]').last().click();
        cy.get(':focus').tab();
        cy.get(':focus').click();
        cy.get('[name^=instruction-step-]').should('have.length', 2);
        cy.contains('Save').click();
        cy.url().should('contain', 'ramen');
        cy.url().should('not.contain', 'edit');

        // Act - Connect with cloud
        cy.visit('/?authenticator=inrupt');
        cy.startApp();
        cy.contains('disconnected').click();
        cy.ariaInput('Login url').type('http://localhost:4000/alice/{enter}');
        cy.cssAuthorize({ reset: true });
        cy.waitForReload({ resetProfiles: true });
        cy.contains('Go ahead').click();

        // Assert
        cy.wait('@patchRamen');
        cy.get('@patchRamen.all').should('have.length', 1);
        cy.assertLocalDocumentEquals('http://localhost:4000/alice/cookbook/ramen', ramenJsonLD);
        cy.assertLocalDocumentDoesNotExist('solid://recipes/ramen');
    });

});
