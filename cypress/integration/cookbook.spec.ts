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
        cy.see('How would you like to begin?');

        // Act - Create
        cy.press('Create your first recipe');
        cy.press('Create from scratch');
        cy.ariaInput('Recipe name').type('Ramen');
        cy.press('Add ingredients');
        cy.currentElement().type('Broth{enter}');
        cy.currentElement().type('Noodles');
        cy.press('Add instructions');
        cy.currentElement().type('Boil the noodles{enter}');
        cy.currentElement().type('Dip them into the broth');
        cy.press('Create recipe');
        cy.see('New recipe');
        cy.see('Ramen');
        cy.reload();

        // Act - First edit
        cy.press('Ramen');
        cy.see('Broth');
        cy.see('Noodles');
        cy.see('Boil the noodles');
        cy.see('Dip them into the broth');
        cy.press('Edit');
        cy.press('Add an image');
        cy.ariaInput('Image url').type('https://media.example.com/ramen.jpg');
        cy.press('Update');
        cy.ariaInput('Recipe name').type('!');
        cy.press('Add ingredient');
        cy.currentElement().type('Toppings');
        cy.ariaInput('Recipe instructions step #1').click();
        cy.currentElement().type('{enter}');
        cy.currentElement().type('Prepare toppings');
        cy.ariaInput('Recipe instructions step #3').click();
        cy.currentElement().clear().type('Dip the noodles into the broth');
        cy.contains('Save').click();
        cy.url().should('contain', 'ramen');
        cy.url().should('not.contain', 'edit');
        cy.reload();

        // Act - Second edit
        cy.press('Edit');
        cy.ariaInput('Recipe instructions step #2').click();
        cy.currentElement().tab();
        cy.currentElement().click();
        cy.get('label:contains("Recipe instructions step")').should('have.length', 2);
        cy.press('Add step');
        cy.currentElement().type('Add toppings');
        cy.press('Save');
        cy.url().should('contain', 'ramen');
        cy.url().should('not.contain', 'edit');
        cy.reload();

        // Assert
        cy.see('Ramen!');
        cy.see('Broth');
        cy.see('Noodles');
        cy.see('Toppings');
        cy.see('Boil the noodles');
        cy.see('Dip the noodles into the broth');
        cy.see('Add toppings');

        cy.assertLocalDocumentEquals('solid://recipes/ramen', firstRamenJsonLD);
    });

    it('Sends model updates to the cloud', () => {
        // Arrange
        cy.intercept('PATCH', 'http://localhost:4000/cookbook/ramen').as('patchRamen');

        cy.login();

        // Act - Create
        cy.goOffline();
        cy.press('Create from scratch');
        cy.ariaInput('Recipe name').type('Ramen');
        cy.press('Add ingredients');
        cy.currentElement().type('Broth{enter}');
        cy.currentElement().type('Noodles');
        cy.press('Create recipe');
        cy.see('There is one pending update');
        cy.comeBackOnline();

        // Act - First update
        cy.goOffline();
        cy.press('Ramen');
        cy.press('Edit');
        cy.get('[name="name"]').type('!');
        cy.press('Write a description');
        cy.currentElement().type('is life');
        cy.press('Add ingredient');
        cy.currentElement().type('Toppings');
        cy.press('Add instructions');
        cy.currentElement().type('Boil the noodles{enter}');
        cy.currentElement().type('Dip them into the broth');
        cy.press('Save');
        cy.see('There are 2 pending updates');
        cy.comeBackOnline();

        // Act - Second update
        cy.goOffline();
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
        cy.see('There are 3 pending updates');
        cy.comeBackOnline();

        // Act - Third update
        cy.goOffline();
        cy.press('Edit');
        cy.ariaInput('Recipe instructions step #3').click();
        cy.currentElement().tab();
        cy.currentElement().click();
        cy.get('label:contains("Recipe instructions step")').should('have.length', 2);
        cy.press('Save');
        cy.see('There is one pending update');
        cy.comeBackOnline();

        // Assert
        cy.see('Jun\'s Ramen');
        cy.see('Instructions: https://www.youtube.com/watch?v=9WXIrnWsaCo');
        cy.see('Broth');
        cy.see('Noodles');
        cy.see('Shiitake');
        cy.see('Nori');
        cy.see('Dip them into the broth!');
        cy.see('Boil the noodles');
        cy.dontSee('Toppings');

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
        cy.see('How would you like to begin?');

        // Act
        cy.press('Create your first recipe');
        cy.press('Create from scratch');
        cy.ariaInput('Recipe name').type('Ramen');
        cy.press('Add an image');
        cy.uploadFixture('Upload an image', 'img/ramen.png');
        cy.see('Remove image');
        cy.press('Update');
        cy.press('Create recipe');

        // Assert
        cy.assertStoredFileMatches('solid://recipes/ramen.png', {
            mimeType: 'image/png',
        });
    });

    it('Uploads images for new recipes', () => {
        // Arrange
        cy.intercept('PUT', 'http://localhost:4000/cookbook/ramen.png').as('putRamenImage');

        cy.see('How would you like to begin?');

        // Act
        cy.press('Create your first recipe');
        cy.press('Create from scratch');
        cy.ariaInput('Recipe name').type('Ramen');
        cy.press('Add an image');
        cy.uploadFixture('Upload an image', 'img/ramen.png');
        cy.see('Remove image');
        cy.press('Update');
        cy.press('Create recipe');

        // TODO go back to home instead of reloading
        cy.visit('/?authenticator=localStorage');
        cy.startApp();
        cy.login({ hasCookbook: true });

        // Assert
        cy.wait('@putRamenImage');

        cy.get('@putRamenImage').its('request.headers.content-type').should('eq', 'image/png');
    });

    it('Uploads images for existing recipes', () => {
        // Arrange
        cy.intercept('PUT', 'http://localhost:4000/cookbook/ramen.png').as('putRamenImage');

        cy.createRecipe({ name: 'Ramen' });
        cy.login({ hasCookbook: true });

        // Act
        cy.press('Ramen');
        cy.press('Edit');
        cy.press('Add an image');
        cy.uploadFixture('Upload an image', 'img/ramen.png');
        cy.see('Remove image');
        cy.press('Update');
        cy.press('Save');

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
        cy.login({ hasCookbook: true });

        // Act
        cy.press('Ramen');
        cy.press('Edit');
        cy.press('Change image');
        cy.press('Remove image');
        cy.uploadFixture('Upload an image', 'img/ramen.png');
        cy.see('Remove image');
        cy.press('Update');
        cy.press('Save');
        cy.see('syncing');
        cy.see('online');

        // Assert
        cy.get('@putRamenImage.all').should('have.length', 2);

        cy.get('@putRamenImage.0').its('request.headers.content-type').should('eq', 'image/png');
        cy.get('@putRamenImage.1').its('request.headers.content-type').should('eq', 'image/png');
    });

    it('Imports recipes from JSON-LD', () => {
        // Act
        cy.see('How would you like to begin?');

        // Assert
        cy.press('Create your first recipe');
        cy.uploadFixture('Upload JsonLD', 'recipes/aguachile.jsonld');

        // Assert
        cy.url().should('contain', 'aguachile');
        cy.see('200g Shrimps');
    });

    it('Imports recipes from the Web', () => {
        // Arrange
        cy.intercept('https://recipes.example.com/hummus', { fixture: 'html/jaimies-hummus.html' });

        cy.see('How would you like to begin?');

        // Act
        cy.press('Create your first recipe');
        cy.press('Import from the Web');
        cy.toggleDetails('Advanced options');
        cy.details('Advanced options').within(() => {
            cy.get('input[type="checkbox"]').click();
        });
        cy.ariaInput('Website URL').type('https://recipes.example.com/hummus');
        cy.press('Scan');
        cy.see('We\'ve found the recipe!');

        // Workaround for https://github.com/cypress-io/cypress/issues/7306
        cy.wait(200);

        cy.see('Simple houmous');
        cy.see('Chickpeas – the star ingredient in houmous – are incredibly good for you.');
        cy.press('Import to my cookbook');

        // Assert
        cy.see('The recipe has been added to your cookbook');
        cy.url().should('contain', 'simple-houmous');
        cy.see('Chickpeas – the star ingredient in houmous – are incredibly good for you.');
        cy.see('1 lemon');
        cy.see('recipe on recipes.example.com');

        cy.assertLocalDocumentEquals('solid://recipes/simple-houmous', jaimiesHummusJsonLD);
    });

    it('Imports recipes from the Web using a proxy', () => {
        // Arrange
        cy.intercept('https://proxy.example.com', { fixture: 'html/jaimies-hummus.html' });

        cy.see('How would you like to begin?');

        // Act
        cy.press('Create your first recipe');
        cy.press('Import from the Web');
        cy.toggleDetails('Advanced options');
        cy.ariaLabel('Proxy url').clear().type('https://proxy.example.com');
        cy.ariaInput('Website URL').type('https://recipes.example.com/hummus');
        cy.press('Scan');
        cy.see('We\'ve found the recipe!');

        // Workaround for https://github.com/cypress-io/cypress/issues/7306
        cy.wait(200);

        cy.see('Simple houmous');
        cy.see('Chickpeas – the star ingredient in houmous – are incredibly good for you.');
        cy.press('Import to my cookbook');

        // Assert
        cy.see('The recipe has been added to your cookbook');
        cy.url().should('contain', 'simple-houmous');
        cy.see('Chickpeas – the star ingredient in houmous – are incredibly good for you.');
        cy.see('1 lemon');
        cy.see('recipe on recipes.example.com');

        cy.assertLocalDocumentEquals('solid://recipes/simple-houmous', jaimiesHummusJsonLD);
    });

    it('Imports recipes from the Web copy & pasting HTML', () => {
        // Arrange
        cy.intercept('https://recipes.example.com/ramen', { statusCode: 404 });

        cy.see('How would you like to begin?');

        // Act
        cy.press('Create your first recipe');
        cy.press('Import from the Web');
        cy.ariaInput('Website URL').type('https://recipes.example.com/ramen');
        cy.press('Scan');
        cy.see('Oops! That didn\'t work');

        // Workaround for https://github.com/cypress-io/cypress/issues/7306
        cy.wait(200);

        cy.press('try copy & pasting HTML');
        cy.fixture('html/juns-ramen.html').then(html => cy.ariaInput('Page source HTML').fill(html));
        cy.press('Scan HTML');
        cy.see('Homemade Ramen');
        cy.see('Cat Merch!');

        // Workaround for https://github.com/cypress-io/cypress/issues/7306
        cy.wait(200);

        cy.press('Import to my cookbook');

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
        cy.dontSee('Public');
        cy.dontSee('Private');
        cy.ariaLabel('JSON-LD').should('match', '[aria-checked="true"]');
        cy.see('Download');
    });

    it('Shares remote recipes', () => {
        // Arrange
        cy.createRecipe({ name: 'Ramen' });
        cy.login({ hasCookbook: true });

        // Act
        cy.press('Ramen');
        cy.press('Share');

        // Assert
        cy.getRecipe('ramen').then(ramen => {
            cy.see('Public', 'button');
            cy.ariaLabel('Umai').should('match', '[aria-checked="true"]');
            cy.see(`${Cypress.config('baseUrl')}/viewer?url=${ramen.getDocumentUrl()}`);

            cy.ariaLabel('Solid url').click();
            cy.ariaLabel('Solid url').should('match', '[aria-checked="true"]');
            cy.see(ramen.url);

            // TODO test sharing button
        });
    });

    it('Deletes local recipes', () => {
        // Arrange
        cy.createRecipe({ name: 'Ramen' }).as('ramen');

        // Act
        cy.press('Ramen');
        cy.press('Edit');
        cy.press('Delete');
        cy.press('Yes, delete recipe');

        // Assert
        cy.see('Ramen has been deleted');
        cy.assertLocalDocumentDoesNotExist('solid://recipes/ramen');
    });

    it('Deletes remotes recipes', () => {
        // Arrange
        cy.createRecipe({ name: 'Ramen' });
        cy.login({ hasCookbook: true });
        cy.request('http://localhost:4000/cookbook/ramen')
            .then(response => cy.wrap(response.body).as('ramenTurtle'));

        cy.intercept('PATCH', 'http://localhost:4000/cookbook/ramen').as('patchRamen');

        // Act
        cy.press('Ramen');
        cy.press('Edit');
        cy.press('Delete');
        cy.press('Yes, delete recipe');

        // Assert
        cy.see('Ramen has been deleted');
        cy.get('@ramenTurtle').then(ramenTurtle => {
            cy.get('@patchRamen').its('request.body').should('be.sparql', `
                DELETE DATA { ${ramenTurtle} } ;
                INSERT DATA {
                    @prefix soukai: <https://soukai.noeldemartin.com/vocab/> .
                    @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

                    <#it>
                        a soukai:Tombstone ;
                        soukai:deletedAt  "[[.*]]"^^xsd:dateTime .
                } .
            `);
        });
        cy.assertLocalDocumentDoesNotExist('http://localhost:4000/cookbook/ramen');
    });

    it('Deletes recipes deleted remotely', () => {
        // Arrange
        cy.createRecipe({ name: 'Ramen' });
        cy.login({ hasCookbook: true });

        cy.request({
            method: 'PUT',
            url: 'http://localhost:4000/cookbook/ramen',
            headers: { 'Content-Type': 'text/turtle' },
            body: `
                @prefix soukai: <https://soukai.noeldemartin.com/vocab/> .
                @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

                <#it>
                    a soukai:Tombstone ;
                    soukai:deletedAt "2022-06-12T00:00:00.000Z"^^xsd:dateTime .
            `,
        });

        // Act
        cy.press('online');
        cy.press('Synchronize now');
        cy.see('Syncing in progress');
        cy.see('Syncing is up to date');

        // Assert
        cy.dontSee('Ramen');
        cy.assertLocalDocumentDoesNotExist('http://localhost:4000/cookbook/ramen');
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
