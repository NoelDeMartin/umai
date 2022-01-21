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
        cy.contains('Are you ready to start cooking?').should('be.visible');

        // Act - Create
        cy.contains('Add your first recipe').click();
        cy.get('[name="name"]').type('Ramen');
        cy.contains('Add ingredient').click();
        cy.get(':focused').type('Broth{enter}');
        cy.get(':focused').type('Noodles');
        cy.contains('Add step').click();
        cy.get(':focused').type('Boil the noodles{enter}');
        cy.get(':focused').type('Dip them into the broth');
        cy.contains('button', 'Create').click();
        cy.url().should('contain', 'ramen');
        cy.reload();

        // Act - First edit
        cy.contains('Edit').click();
        cy.contains('Change image').click();
        cy.get('[name="image_url"]').type('https://media.example.com/ramen.jpg');
        cy.get('button[aria-label="Clear image"]');
        cy.contains('Update image').click();
        cy.get('[name="name"]').type('!');
        cy.contains('button', 'Add ingredient').click();
        cy.get(':focus').type('Toppings');
        cy.get('[name^="instruction-step-"]').first().click();
        cy.get(':focus').type('{enter}');
        cy.get(':focus').type('Prepare toppings');
        cy.get('[name^="instruction-step-"]').last().click();
        cy.get(':focus').clear().type('Dip the noodles into the broth');
        cy.contains('Save').click();
        cy.url().should('contain', 'ramen');
        cy.url().should('not.contain', 'edit');
        cy.reload();

        // Act - Second edit
        cy.contains('Edit').click();
        cy.get('[name^="instruction-step-"]').eq(1).click();
        cy.get(':focus').tab();
        cy.get(':focus').click();
        cy.get('[name^=instruction-step-]').should('have.length', 2);
        cy.contains('Add step').click();
        cy.get(':focus').type('Add toppings');
        cy.contains('Save').click();
        cy.url().should('contain', 'ramen');
        cy.url().should('not.contain', 'edit');
        cy.reload();

        // Assert
        cy.contains('Ramen!').should('be.visible');
        cy.contains('Broth').should('be.visible');
        cy.contains('Noodles').should('be.visible');
        cy.contains('Toppings').should('be.visible');
        cy.contains('Boil the noodles').scrollIntoView().should('be.visible');
        cy.contains('Dip the noodles into the broth').scrollIntoView().should('be.visible');
        cy.contains('Add Toppings').should('not.exist');

        cy.assertLocalDocumentEquals('solid://recipes/ramen', firstRamenJsonLD);
    });

    it('sends model updates to the cloud', () => {
        // Arrange
        cy.login();

        cy.intercept('PATCH', 'http://localhost:4000/cookbook/ramen').as('patchRamen');

        // Act - Create
        cy.contains('Add your first recipe').click();
        cy.get('[name="name"]').type('Ramen');
        cy.contains('button', 'Add ingredient').click();
        cy.get(':focus').type('Broth{enter}');
        cy.get(':focus').type('Noodles');
        cy.contains('button', 'Create').click();
        cy.contains('There is one pending update');
        cy.contains('Syncing is up to date');

        // Act - First update
        cy.contains('Edit').click();
        cy.get('[name="name"]').type('!');
        cy.get('[name="description"]').type('is life');
        cy.contains('button', 'Add ingredient').click();
        cy.get(':focus').type('Toppings');
        cy.contains('Add step').click();
        cy.get(':focus').type('Boil the noodles{enter}');
        cy.get(':focus').type('Dip them into the broth');
        cy.contains('Save').click();
        cy.contains('There are 2 pending updates');
        cy.contains('Syncing is up to date');

        // Act - Second update
        cy.contains('Edit').click();
        cy.get('[name="name"]').clear().type('Jun\'s Ramen');
        cy.get('[name="description"]').clear().type('Instructions: https://www.youtube.com/watch?v=9WXIrnWsaCo');
        cy.get('[name^="ingredient-"]').last().click();
        cy.get(':focus').clear().type('Shiitake{enter}');
        cy.get(':focus').type('Nori');
        cy.get('[name^="instruction-step-"]').last().click();
        cy.get(':focus').type('!{enter}');
        cy.get(':focus').type('Add Toppings');
        cy.contains('Save').click();
        cy.contains('There are 3 pending updates');
        cy.contains('Syncing is up to date');

        // Act - Third update
        cy.contains('Edit').click();
        cy.get('[name^="instruction-step-"]').last().click();
        cy.get(':focus').tab();
        cy.get(':focus').click();
        cy.get('[name^=instruction-step-]').should('have.length', 2);
        cy.contains('Save').click();
        cy.contains('There is one pending update');
        cy.contains('Syncing is up to date');

        // Assert
        cy.contains('Jun\'s Ramen').should('be.visible');
        cy.contains('Instructions: https://www.youtube.com/watch?v=9WXIrnWsaCo').should('be.visible');
        cy.contains('Broth').should('be.visible');
        cy.contains('Noodles').should('be.visible');
        cy.contains('Shiitake').should('be.visible');
        cy.contains('Nori').should('be.visible');
        cy.contains('Dip them into the broth!').scrollIntoView().should('be.visible');
        cy.contains('Boil the noodles').scrollIntoView().should('be.visible');
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
