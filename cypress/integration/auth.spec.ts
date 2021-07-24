describe('Authentication', () => {

    it('logs in using the localStorage authenticator', () => {
        // Arrange
        cy.intercept('https://alice.example.com', { statusCode: 404 });
        cy.intercept('https://alice.example.com/profile/card', { fixture: 'profile.ttl' });
        cy.prepareAnswer('Login url?', 'https://alice.example.com');
        cy.task('resetSolidPOD');
        cy.visit('/');
        cy.startApp();

        // Act
        cy.contains('Connect storage').click();
        cy.waitForReload();

        // Assert
        cy.contains('you\'re connected to http://localhost:4000/').should('be.visible');
    });

    it('logs in using the Inrupt authenticator', () => {
        // Arrange
        cy.intercept('POST', 'http://localhost:4000/alice/').as('createCookbook');
        cy.intercept('PUT', 'http://localhost:4000/alice/settings/privateTypeIndex').as('createTypeIndex');
        cy.intercept('PATCH', 'http://localhost:4000/alice/settings/privateTypeIndex').as('registerCookbook');
        cy.intercept('PATCH', 'http://localhost:4000/alice/cookbook/ramen').as('patchRamen');
        cy.prepareAnswer('Login url?', 'http://localhost:4000/alice/');
        cy.visit('/?authenticator=inrupt');
        cy.startApp();

        // Act - Log in
        cy.contains('Connect storage').click();
        cy.cssAuthorize({ resetPOD: true });
        cy.waitForReload({ resetProfiles: true });

        // Act - Create recipe
        cy.contains('New Recipe').click();
        cy.get('#name').type('Ramen');
        cy.contains('Create').click();
        cy.get('[aria-label="Sync"]').click();
        cy.get('.animate-spin').should('not.exist');

        // Assert
        cy.contains('you\'re connected to http://localhost:4000/', { timeout: 10000 }).should('be.visible');

        cy.get('@createCookbook').its('request.headers.authorization').should('match', /DPoP .*/);
        cy.get('@createTypeIndex').its('request.headers.authorization').should('match', /DPoP .*/);
        cy.get('@registerCookbook').its('request.headers.authorization').should('match', /DPoP .*/);
        cy.get('@patchRamen').its('request.headers.authorization').should('match', /DPoP .*/);
    });

});
