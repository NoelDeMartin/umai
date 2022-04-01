// TODO configure .jsonld loader
import path from 'path';

import firstRamenJsonLD from '@cy/fixtures/ramen-1.json';
import jaimiesHummusJsonLD from '@cy/fixtures/jaimies-hummus.json';
import junsRamenJsonLD from '@cy/fixtures/juns-ramen.json';
import secondRamenJsonLD from '@cy/fixtures/ramen-2.json';

describe('Cookbook', () => {

    beforeEach(() => {
        cy.task('resetSolidPOD');
        cy.visit('/recipes?authenticator=localStorage');
        cy.startApp();
    });

    it('Creates and edits recipes', () => {
        // Arrange
        cy.contains('Are you ready to start cooking?').should('be.visible');

        // Act - Create
        cy.contains('Create from scratch').click();
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
        cy.get('[name="customUrl"]').type('https://media.example.com/ramen.jpg');
        cy.contains('Update').click();
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

    it('Sends model updates to the cloud', () => {
        // Arrange
        cy.intercept('PATCH', 'http://localhost:4000/cookbook/ramen').as('patchRamen');

        cy.login();

        // Act - Create
        cy.goOffline();
        cy.contains('Create from scratch').click();
        cy.get('[name="name"]').type('Ramen');
        cy.contains('button', 'Add ingredient').click();
        cy.get(':focus').type('Broth{enter}');
        cy.get(':focus').type('Noodles');
        cy.contains('button', 'Create').click();
        cy.see('There is one pending update');
        cy.comeBackOnline();

        // Act - First update
        cy.goOffline();
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
        cy.comeBackOnline();

        // Act - Second update
        cy.goOffline();
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
        cy.comeBackOnline();

        // Act - Third update
        cy.goOffline();
        cy.contains('Edit').click();
        cy.get('[name^="instruction-step-"]').last().click();
        cy.get(':focus').tab();
        cy.get(':focus').click();
        cy.get('[name^=instruction-step-]').should('have.length', 2);
        cy.contains('Save').click();
        cy.contains('There is one pending update');
        cy.comeBackOnline();

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

    it('Stores local images', () => {
        // Arrange
        cy.contains('Are you ready to start cooking?').should('be.visible');

        // Act
        cy.contains('Create from scratch').click();
        cy.get('[name="name"]').type('Ramen');
        cy.contains('Change image').click();
        cy.uploadFixture('Upload an image', 'img/ramen.png');
        cy.contains('Remove image').should('be.visible');
        cy.contains('Update').click();
        cy.contains('button', 'Create').click();

        // Assert
        cy.assertStoredFileMatches('solid://recipes/ramen.png', {
            mimeType: 'image/png',
        });
    });

    it('Uploads images for new recipes', () => {
        // Arrange
        cy.intercept('PUT', 'http://localhost:4000/cookbook/ramen.png').as('putRamenImage');

        cy.contains('Are you ready to start cooking?').should('be.visible');

        // Act
        cy.contains('Create from scratch').click();
        cy.get('[name="name"]').type('Ramen');
        cy.contains('Change image').click();
        cy.uploadFixture('Upload an image', 'img/ramen.png');
        cy.contains('Remove image').should('be.visible');
        cy.contains('Update').click();
        cy.contains('button', 'Create').click();

        // TODO go back to home instead of reloading
        cy.visit('/?authenticator=localStorage');
        cy.startApp();
        cy.login();

        // Assert
        cy.wait('@putRamenImage');

        cy.get('@putRamenImage').its('request.headers.content-type').should('eq', 'image/png');
    });

    it('Uploads images for existing recipes', () => {
        // Arrange
        cy.intercept('PUT', 'http://localhost:4000/cookbook/ramen.png').as('putRamenImage');

        cy.createRecipe({ name: 'Ramen' });
        cy.login();

        // Act
        cy.contains('Ramen').click();
        cy.contains('Edit').click();
        cy.contains('Change image').click();
        cy.uploadFixture('Upload an image', 'img/ramen.png');
        cy.contains('Remove image').should('be.visible');
        cy.contains('Update').click();
        cy.contains('Save').click();

        // Assert
        cy.wait('@putRamenImage');

        cy.get('@putRamenImage').its('request.headers.content-type').should('eq', 'image/png');
    });

    it('Updates images', () => {
        // Arrange
        cy.intercept('PUT', 'http://localhost:4000/cookbook/ramen.png').as('putRamenImage');

        cy.createRecipe({
            name: 'Ramen',
            imageUrl: 'solid://recipes/ramen.png',
        });
        cy.createFile('solid://recipes/ramen.png', 'image/png', 'img/ramen.png');
        cy.login();

        // Act
        cy.contains('Ramen').click();
        cy.contains('Edit').click();
        cy.contains('Change image').click();
        cy.contains('Remove image').click();
        cy.uploadFixture('Upload an image', 'img/ramen.png');
        cy.contains('Remove image').should('be.visible');
        cy.contains('Update').click();
        cy.contains('Save').click();
        cy.contains('syncing').should('be.visible');
        cy.contains('online').should('be.visible');

        // Assert
        cy.get('@putRamenImage.all').should('have.length', 2);

        cy.get('@putRamenImage.0').its('request.headers.content-type').should('eq', 'image/png');
        cy.get('@putRamenImage.1').its('request.headers.content-type').should('eq', 'image/png');
    });

    it('Imports recipes from JSON-LD', () => {
        // Act
        cy.contains('Are you ready to start cooking?').should('be.visible');

        // Assert
        cy.uploadFixture('Upload JsonLD', 'recipes/aguachile.jsonld');

        // Assert
        cy.url().should('contain', 'aguachile');
        cy.contains('200g Shrimps').scrollIntoView().should('be.visible');
    });

    it('Imports recipes from the Web', () => {
        // Arrange
        cy.intercept('https://recipes.example.com/hummus', { fixture: 'html/jaimies-hummus.html' });

        cy.see('Are you ready to start cooking?');

        // Act
        cy.contains('Import from the Web').click();
        cy.ariaInput('Website URL').type('https://recipes.example.com/hummus');
        cy.contains('Scan website for recipes').click();
        cy.see('We\'ve found the recipe!');

        // TODO this shouldn't be necessary! there seems to be something wrong with the modal because it's
        // re-rendering too much...
        cy.wait(200);

        cy.see('Simple houmous');
        cy.see('Chickpeas – the star ingredient in houmous – are incredibly good for you.');
        cy.contains('Import to my cookbook').click();

        // Assert
        cy.see('The recipe has been added to your cookbook');
        cy.url().should('contain', 'simple-houmous');
        cy.see('Chickpeas – the star ingredient in houmous – are incredibly good for you.');
        cy.see('1 lemon');
        cy.see('recipe on recipes.example.com');

        cy.assertLocalDocumentEquals('solid://recipes/simple-houmous', jaimiesHummusJsonLD);
    });

    it.skip('Imports recipes from the Web using a proxy');

    it('Imports recipes from the Web copy & pasting HTML', () => {
        // Arrange
        cy.intercept('https://recipes.example.com/ramen', { statusCode: 404 });

        cy.see('Are you ready to start cooking?');

        // Act
        cy.contains('Import from the Web').click();
        cy.ariaInput('Website URL').type('https://recipes.example.com/ramen');
        cy.contains('Scan website for recipes').click();
        cy.see('Oops! That didn\'t work');

        // TODO this shouldn't be necessary! there seems to be something wrong with the modal because it's
        // re-rendering too much...
        cy.wait(200);

        cy.toggleDetails('Try again');
        cy.toggleDetails('Copy & paste HTML');
        cy.fixture('html/juns-ramen.html').then(html => cy.ariaInput('Page source HTML').fill(html));
        cy.contains('button', 'Scan HTML').click();
        cy.see('Homemade Ramen');
        cy.see('Cat Merch!');
        cy.contains('Import to my cookbook').click();

        // Assert
        cy.see('The recipe has been added to your cookbook');
        cy.url().should('contain', 'homemade-ramen');
        cy.see('Cat Merch!');
        cy.see('recipe on recipes.example.com');

        cy.assertLocalDocumentEquals('solid://recipes/homemade-ramen', junsRamenJsonLD);
    });

    it('Shares local recipes', () => {
        // Arrange
        cy.createRecipe({ name: 'Ramen' }).as('ramen');

        // Act
        cy.press('Ramen');
        cy.press('Share');

        // Assert
        cy.ariaLabel('Umai').should('not.exist');
        cy.ariaLabel('Solid url').should('not.exist');
        cy.ariaLabel('JSON-LD').should('match', '[aria-checked="true"]');
        cy.see('Download');
    });

    it('Shares remote recipes', () => {
        // Arrange
        cy.createRecipe({ name: 'Ramen' });
        cy.login();

        // Act
        cy.press('Ramen');
        cy.press('Share');

        // Assert
        cy.getRecipe('ramen').then(ramen => {
            cy.ariaLabel('Umai').should('match', '[aria-checked="true"]');
            cy.see(`${Cypress.config('baseUrl')}/viewer?url=${ramen.getDocumentUrl()}`);

            cy.ariaLabel('Solid url').click();
            cy.ariaLabel('Solid url').should('match', '[aria-checked="true"]');
            cy.see(ramen.url);

            // TODO test sharing button
        });
    });

    it('Downloads recipes', () => {
        // Arrange
        const downloadsFolder = Cypress.config('downloadsFolder');

        cy.task('deleteFolder', downloadsFolder);
        cy.createRecipe({ name: 'Ramen' });
        cy.press('Ramen');

        // Act
        cy.press('Share');

        // Assert
        cy.see('"@type": "Recipe"');
        cy.see('"name": "Ramen"');
        cy.press('Download');

        cy.readFile(path.join(downloadsFolder, 'ramen.json')).then(recipe => {
            expect(recipe.name).to.equal('Ramen');
        });
    });

});
