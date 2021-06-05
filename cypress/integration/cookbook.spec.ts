describe('Cookbook', () => {

    beforeEach(() => {
        indexedDB.deleteDatabase('soukai');
        indexedDB.deleteDatabase('soukai-meta');

        cy.task('resetSolidPOD');
        cy.intercept('**', req => {
            if (req.url.startsWith('http://localhost'))
                return;

            req.reply({ statusCode: 500, body: 'External requests not allowed in Cypress tests!' });
        });

        cy.visit('/');
        cy.window().then(window => window.prompt = (_, defaultValue) => defaultValue || null);

        // TODO this should be done in the app
        cy.request({
            method: 'POST',
            url: 'http://localhost:4000',
            headers: {
                'Slug': 'cookbook',
                'Content-Type': 'text/turtle',
                'Link': '<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"',
            },
            body: '<> <http://www.w3.org/2000/01/rdf-schema#label> "My Cookbook" .',
        });
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

    it('sends model updates to the cloud', function() {
        // Arrange
        cy.intercept('PATCH', 'http://localhost:4000/cookbook/ramen').as('patch');

        // Act - Initial sync
        cy.contains('Connect storage').click();
        cy.contains('you\'re connected to').should('be.visible');
        cy.get('[aria-label="Sync"]').click();
        cy.get('.animate-spin').should('not.exist');

        // Act - Create
        cy.contains('New Recipe').click();
        cy.get('#name').type('Ramen');
        cy.contains('Create').click();
        cy.get('[aria-label="Sync"]').click();
        cy.get('.animate-spin').should('not.exist');

        // Act - First Update
        cy.contains('edit').click();
        cy.get('#name').type('!');
        cy.get('#description').type('is life');
        cy.contains('Save').click();
        cy.get('[aria-label="Sync"]').click();
        cy.get('.animate-spin').should('not.exist');

        // Act - Second Update
        cy.contains('edit').click();
        cy.get('#name').clear().type('Jun\'s Ramen');
        cy.get('#description').clear().type('Instructions: https://www.youtube.com/watch?v=9WXIrnWsaCo');
        cy.contains('Save').click();
        cy.get('[aria-label="Sync"]').click();
        cy.get('.animate-spin').should('not.exist');

        // Assert
        const fixtures: string[] = [];

        Cypress.Promise.all([
            cy.fixture('create-ramen.sparql').then(fixture => fixtures.push(fixture)),
            cy.fixture('update-ramen-1.sparql').then(fixture => fixtures.push(fixture)),
            cy.fixture('update-ramen-2.sparql').then(fixture => fixtures.push(fixture)),
        ]).then(() => {
            fixtures.forEach(fixture => cy.wait('@patch').its('request.body').should('be.sparql', fixture));

            cy.get('@patch.all').should('have.length', fixtures.length);
        });
    });

});
