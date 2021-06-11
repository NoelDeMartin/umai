describe('Cookbook', () => {

    beforeEach(() => {
        cy.visit('/');
        cy.startApp();
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
        cy.login();

        cy.intercept('PATCH', 'http://localhost:4000/cookbook/ramen').as('patchRamen');

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
            fixtures.forEach(fixture => cy.wait('@patchRamen').its('request.body').should('be.sparql', fixture));

            cy.get('@patchRamen.all').should('have.length', fixtures.length);
        });
    });

});
