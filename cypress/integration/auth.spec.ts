describe('Authentication', () => {

    it('logs in using the localStorage authenticator', () => {
        // Arrange
        cy.intercept('https://alice.example.com', { statusCode: 404 });
        cy.intercept('https://alice.example.com/profile/card', { fixture: 'profile.ttl' });
        cy.prepareAnswer('Login url?', 'https://alice.example.com');
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
        cy.prepareAnswer('Login url?', 'http://localhost:4000/alice/');
        cy.visit('/?authenticator=inrupt');
        cy.startApp();

        // Act
        cy.contains('Connect storage').click();
        cssAuthorize();
        cy.waitForReload();

        // Assert
        cy.contains('you\'re connected to http://localhost:4000/', { timeout: 10000 }).should('be.visible');
    });

});

function cssAuthorize() {
    const requestOptions = {
        url: 'http://localhost:4000/alice/profile/card',
        failOnStatusCode: false,
    };

    cy.request(requestOptions).then(({ isOkStatusCode }) => {
        if (!isOkStatusCode) {
            cssRegister();

            return;
        }

        cssLogin();
    });
}

function cssLogin() {
    cy.get('#email').type('alice@example.com');
    cy.get('#password').type('secret');
    cy.contains('button', 'Sign In').click();
}

function cssRegister() {
    // Create profile
    cy.fixture('profile.ttl').then(turtle => cy.request({
        url: 'http://localhost:4000/alice/profile/card',
        method: 'PUT',
        headers: { 'Content-Type': 'text/turtle' },
        body: turtle,
    }));

    // Attempt registration
    cy.contains('Register').click();
    cy.get('#email').type('alice@example.com');
    cy.get('#webId').type('http://localhost:4000/alice/profile/card#me');
    cy.get('#password').type('secret');
    cy.get('#confirmPassword').type('secret');
    cy.contains('Create Identity').click();

    // Add missing triples to profile
    cy.get('form .input-wrap label[style]').then($el => {
        const errorMessage = $el.text();
        const missingTriples = errorMessage.match(/([\s\S]+?)Must be added to the WebId/)?.[1];

        cy.request({
            url: 'http://localhost:4000/alice/profile/card',
            method: 'PATCH',
            headers: { 'Content-Type': 'application/sparql-update' },
            body: `INSERT DATA { ${missingTriples} }`,
        });
    });

    // Complete registration
    cy.get('#password').type('secret');
    cy.get('#confirmPassword').type('secret');
    cy.contains('Create Identity').click();
}
