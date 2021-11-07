// TODO configure .jsonld loader
import firstRamenJsonLD from '@cy/fixtures/ramen-1.json';
import secondRamenJsonLD from '@cy/fixtures/ramen-2.json';

describe('Cookbook', () => {

    beforeEach(() => {
        cy.task('resetSolidPOD');
        cy.visit('/recipes?authenticator=localStorage');
        cy.startApp();
    });

    it('creates and edits recipes', () => {
        // Arrange
        cy.contains('You don\'t have any recipes in your cookbook!').should('be.visible');

        // Act - Create
        cy.contains('New Recipe').click();
        cy.get('#name').type('Ramen');
        cy.get('#new-ingredient').type('Broth');
        cy.get('[aria-label="Add ingredient"]').click();
        cy.get('#new-ingredient').type('Noodles');
        cy.get('[aria-label="Add ingredient"]').click();
        cy.get('#new-instruction-step').type('Boil the noodles');
        cy.get('[aria-label="Add instruction step"]').click();
        cy.get('#new-instruction-step').type('Dip them into the broth');
        cy.get('[aria-label="Add instruction step"]').click();
        cy.contains('Create').click();
        cy.url().should('contain', 'ramen');
        cy.reload();

        // Act - First edit
        cy.contains('edit').click();
        cy.get('#name').type('!');
        cy.get('#new-ingredient').type('Toppings');
        cy.get('[aria-label="Add ingredient"]').click();
        cy.get('#new-instruction-step').type('Add Toppings');
        cy.get('[aria-label="Add instruction step"]').click();
        cy.contains('2. Dip them into the broth').within(() => {
            cy.prepareAnswer('What\'s the new text?', 'Dip them into the broth!');
            cy.get('[aria-label="Change instruction step text"]').click();
        });
        cy.contains('Save').click();
        cy.url().should('contain', 'ramen');
        cy.url().should('not.contain', 'edit');
        cy.reload();

        // Act - Second edit
        cy.contains('edit').click();
        cy.contains('2. Dip them into the broth!').within(() => {
            cy.get('[aria-label="Move instruction step up"]').click();
        });
        cy.contains('3. Add Toppings').within(() => {
            cy.get('[aria-label="Remove instruction step"]').click();
        });
        cy.contains('Save').click();
        cy.url().should('contain', 'ramen');
        cy.url().should('not.contain', 'edit');
        cy.reload();

        // Assert
        cy.contains('Ramen!').should('be.visible');
        cy.contains('No description').should('be.visible');
        cy.contains('Broth').should('be.visible');
        cy.contains('Noodles').should('be.visible');
        cy.contains('Toppings').should('be.visible');
        cy.contains('1. Dip them into the broth!').should('be.visible');
        cy.contains('2. Boil the noodles').should('be.visible');
        cy.contains('Add Toppings').should('not.exist');

        cy.assertLocalDocumentEquals('solid://recipes/ramen', firstRamenJsonLD);
    });

    it('sends model updates to the cloud', () => {
        // Arrange
        cy.login();

        cy.intercept('PATCH', 'http://localhost:4000/cookbook/ramen').as('patchRamen');

        // Act - Create
        cy.contains('New Recipe').click();
        cy.get('#name').type('Ramen');
        cy.get('#new-ingredient').type('Broth');
        cy.get('[aria-label="Add ingredient"]').click();
        cy.get('#new-ingredient').type('Noodles');
        cy.get('[aria-label="Add ingredient"]').click();
        cy.contains('Create').click();
        cy.get('[aria-label="Sync"]').click();
        cy.get('.animate-spin').should('not.exist');

        // Act - First update
        cy.contains('edit').click();
        cy.get('#name').type('!');
        cy.get('#description').type('is life');
        cy.get('#new-ingredient').type('Toppings');
        cy.get('[aria-label="Add ingredient"]').click();
        cy.get('#new-instruction-step').type('Boil the noodles');
        cy.get('[aria-label="Add instruction step"]').click();
        cy.get('#new-instruction-step').type('Dip them into the broth');
        cy.get('[aria-label="Add instruction step"]').click();
        cy.contains('Save').click();
        cy.get('[aria-label="Sync"]').click();
        cy.get('.animate-spin').should('not.exist');

        // Act - Second update
        cy.contains('edit').click();
        cy.get('#name').clear().type('Jun\'s Ramen');
        cy.get('#description').clear().type('Instructions: https://www.youtube.com/watch?v=9WXIrnWsaCo');
        cy.get('[aria-label="Remove \'Toppings\' ingredient"]').click();
        cy.get('#new-ingredient').type('Shiitake');
        cy.get('[aria-label="Add ingredient"]').click();
        cy.get('#new-ingredient').type('Nori');
        cy.get('[aria-label="Add ingredient"]').click();
        cy.get('#new-instruction-step').type('Add Toppings');
        cy.contains('2. Dip them into the broth').within(() => {
            cy.prepareAnswer('What\'s the new text?', 'Dip them into the broth!');
            cy.get('[aria-label="Change instruction step text"]').click();
        });
        cy.get('[aria-label="Add instruction step"]').click();
        cy.contains('Save').click();
        cy.get('[aria-label="Sync"]').click();
        cy.get('.animate-spin').should('not.exist');

        // Act - Third update
        cy.contains('edit').click();
        cy.contains('2. Dip them into the broth!').within(() => {
            cy.get('[aria-label="Move instruction step up"]').click();
        });
        cy.contains('3. Add Toppings').within(() => {
            cy.get('[aria-label="Remove instruction step"]').click();
        });
        cy.contains('Save').click();
        cy.get('[aria-label="Sync"]').click();
        cy.get('.animate-spin').should('not.exist');

        // Assert
        cy.contains('Jun\'s Ramen').should('be.visible');
        cy.contains('Instructions: https://www.youtube.com/watch?v=9WXIrnWsaCo').should('be.visible');
        cy.contains('Broth').should('be.visible');
        cy.contains('Noodles').should('be.visible');
        cy.contains('Shiitake').should('be.visible');
        cy.contains('Nori').should('be.visible');
        cy.contains('1. Dip them into the broth!').should('be.visible');
        cy.contains('2. Boil the noodles').should('be.visible');
        cy.contains('Toppings').should('not.exist');

        const fixtures: string[] = [];

        Cypress.Promise.all([
            cy.fixture('create-ramen.sparql').then(fixture => fixtures.push(fixture)),
            cy.fixture('update-ramen-1.sparql').then(fixture => fixtures.push(fixture)),
            cy.fixture('update-ramen-2.sparql').then(fixture => fixtures.push(fixture)),
            cy.fixture('update-ramen-3.sparql').then(fixture => fixtures.push(fixture)),
        ]).then(() => {
            fixtures.forEach(fixture => cy.wait('@patchRamen').its('request.body').should('be.sparql', fixture));

            cy.get('@patchRamen.all').should('have.length', fixtures.length);
        });

        cy.assertLocalDocumentEquals('http://localhost:4000/cookbook/ramen', secondRamenJsonLD);
    });

});
