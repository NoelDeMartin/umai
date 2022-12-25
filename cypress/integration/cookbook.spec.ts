// TODO configure .jsonld loader
import path from 'path';

import type { Services } from '@/framework/core';

import firstRamenJsonLD from '@cy/fixtures/recipes/ramen-1.json';
import jaimiesHummusJsonLD from '@cy/fixtures/recipes/jaimies-hummus.json';
import junsRamenJsonLD from '@cy/fixtures/recipes/juns-ramen.json';
import pistoJsonLD from '@cy/fixtures/recipes/pisto.json';
import ramenJsonLD from '@cy/fixtures/recipes/ramen.json';
import secondRamenJsonLD from '@cy/fixtures/recipes/ramen-2.json';

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
        cy.press('Add instructions');
        cy.currentElement().type('Boil the noodles{enter}');
        cy.currentElement().type('Dip them into the broth');
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
        cy.ariaInput('Recipe instructions step #2').click();
        cy.currentElement().type('{enter}');
        cy.currentElement().type('Add toppings');
        cy.press('Save');
        cy.see('There is one pending update');
        cy.comeBackOnline();

        // Act - Second update
        cy.goOffline();
        cy.press('Edit');
        cy.ariaInput('Recipe name').clear().type('Jun\'s Ramen');
        cy.press('Add urls');
        cy.currentElement().type('https://www.youtube.com/watch?v=9WXIrnWsaCo');
        cy.ariaInput('Recipe ingredient #3').click();
        cy.currentElement().clear().type('Shiitake{enter}');
        cy.currentElement().type('Nori');
        cy.ariaInput('Recipe instructions step #3').click();
        cy.currentElement().clear().type('Add shiitake topping{enter}');
        cy.currentElement().type('Add nori topping');
        cy.press('Save');
        cy.see('There is one pending update');
        cy.comeBackOnline();

        // Act - Third update
        cy.goOffline();
        cy.press('Edit');
        cy.ariaInput('Recipe instructions step #3').click();
        cy.currentElement().tab();
        cy.currentElement().click();
        cy.get('label:contains("Recipe instructions step")').should('have.length', 3);
        cy.ariaInput('Recipe instructions step #3').click();
        cy.currentElement().clear().type('Add shiitake and nori toppings');
        cy.press('Save');
        cy.see('There is one pending update');
        cy.comeBackOnline();

        // Assert
        cy.see('Jun\'s Ramen');
        cy.see('is life');
        cy.see('recipe on youtube.com');
        cy.see('Broth');
        cy.see('Noodles');
        cy.see('Shiitake');
        cy.see('Nori');
        cy.see('Boil the noodles');
        cy.see('Dip them into the broth');
        cy.see('Add shiitake and nori toppings');
        cy.dontSee('Toppings');
        cy.dontSee('Add toppings');
        cy.dontSee('Add nori topping');
        cy.dontSee('Add shiitake topping');

        const fixtures: string[] = [];

        Cypress.Promise.all([
            cy.fixture('sparql/create-ramen.sparql').then(fixture => fixtures.push(fixture)),
            cy.fixture('sparql/update-ramen-1.sparql').then(fixture => fixtures.push(fixture)),
            cy.fixture('sparql/update-ramen-2.sparql').then(fixture => fixtures.push(fixture)),
            cy.fixture('sparql/update-ramen-3.sparql').then(fixture => fixtures.push(fixture)),
        ]).then(() => {
            fixtures.forEach(fixture => cy.wait('@patchRamen').its('request.body').should('be.sparql', fixture));

            cy.get('@patchRamen.all').should('have.length', fixtures.length);
        });

        cy.assertLocalDocumentEquals('http://localhost:4000/cookbook/ramen', secondRamenJsonLD);
    });

    it('Reconciles remote and local changes', () => {
        // Arrange
        cy.login();
        cy.createRecipe({ name: 'Ramen', description: 'is good' }).then(ramen => {
            const updatedAt = new Date();

            cy.wrap(updatedAt).as('updatedAt');
            cy.sync();
            cy.updateSolidDocument('/cookbook/ramen', 'sparql/update-ramen-name.sparql', {
                createdAt: ramen.createdAt.toISOString(),
                updatedAt: updatedAt.toISOString(),
            });
        });

        cy.intercept('PATCH', 'http://localhost:4000/cookbook/ramen').as('patchRamen');

        // Act
        cy.press('Ramen');
        cy.press('Edit');
        cy.ariaInput('description').type('!');
        cy.press('Save');
        cy.waitForSync();

        // Assert
        cy.see('Ramen!');
        cy.see('is good!');

        cy.get<Date>('@updatedAt').then(updatedAt => {
            const replacements = { updatedAt: updatedAt.toISOString() };

            cy.fixtureWithReplacements('sparql/reconcile-ramen.sparql', replacements).then(sparql => {
                cy.get('@patchRamen').its('request.body').should('be.sparql', sparql);
            });
        });
    });

    it('Edits metadata', () => {
        // Arrange
        cy.see('How would you like to begin?');

        // Act
        cy.press('Create your first recipe');
        cy.press('Create from scratch');
        cy.ariaInput('Recipe name').type('Ramen');
        cy.ariaLabel('Servings').type('3 persons');
        cy.ariaLabel('Preparation time').type('1 day');
        cy.ariaLabel('Cooking time').type('1h 30m');
        cy.press('Create recipe');
        cy.url().should('equal', `${Cypress.config('baseUrl')}/`);
        cy.press('Ramen');

        // Assert
        cy.see('3 persons');
        cy.see('1 day');
        cy.see('1 hour 30 min');

        cy.assertLocalDocumentEquals('solid://recipes/ramen', ramenJsonLD);
    });

    it('Changes servings', () => {
        // Arrange
        cy.see('How would you like to begin?');

        cy.press('Create your first recipe');
        cy.press('Create from scratch');
        cy.ariaInput('Recipe name').type('Ramen');
        cy.press('Add ingredients');
        cy.currentElement().type('500g Boston Butt Pork{enter}');
        cy.currentElement().type('200ml Soy Sauce{enter}');
        cy.currentElement().type('3-5 slices of Ginger{enter}');
        cy.currentElement().type('2 Dried Shiitake Mushrooms');
        cy.ariaLabel('Servings').type('3 persons');
        cy.press('Create recipe');
        cy.press('Ramen', 'a');

        // Act
        cy.ariaSelect('Change servings').select('9 persons');

        // Assert
        cy.see('1500g Boston Butt Pork');
        cy.see('600ml Soy Sauce');
        cy.see('9 - 15 slices of Ginger');
        cy.see('6 Dried Shiitake Mushrooms');
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

    it('Replaces uploaded images', () => {
        // Arrange
        cy.createRecipe({
            name: 'Ramen',
            imageUrls: ['solid://recipes/ramen.png'],
        });
        cy.login({ hasCookbook: true });

        cy.intercept('PATCH', 'http://localhost:4000/cookbook/ramen').as('patchRamen');
        cy.intercept('PUT', 'http://localhost:4000/cookbook/ramen.png').as('putRamenImage');

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
        cy.get('@putRamenImage').its('request.headers.content-type').should('eq', 'image/png');
        cy.get('@patchRamen').should('be.null');
    });

    it('Replaces image urls with uploads', () => {
        // Arrange
        cy.createRecipe({
            name: 'Ramen',
            imageUrls: ['https://images.recipes.com/ramen.png'],
        });
        cy.login({ hasCookbook: true });

        cy.intercept('PATCH', 'http://localhost:4000/cookbook/ramen').as('patchRamen');
        cy.intercept('PUT', 'http://localhost:4000/cookbook/ramen.png').as('putRamenImage');

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
        cy.get('@putRamenImage').its('request.headers.content-type').should('eq', 'image/png');
        cy.fixture('sparql/update-image.sparql').then(sparql => {
            cy.get('@patchRamen').its('request.body').should('be.sparql', sparql);
        });
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
        cy.contains('h2', 'Instructions').next('ol').children().should('have.length', 3);
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
        cy.ariaInput('Recipe name').clear().type('Houmous');
        cy.press('Create recipe');
        cy.press('Houmous', 'a');

        // Assert
        cy.url().should('contain', 'houmous');
        cy.see('10 min');
        cy.see('Chickpeas – the star ingredient in houmous – are incredibly good for you.');
        cy.see('1 lemon');
        cy.see('recipe on recipes.example.com');
        cy.contains('h2', 'Instructions').next('ol').children().should('have.length', 7);

        cy.assertLocalDocumentEquals('solid://recipes/houmous', jaimiesHummusJsonLD);
    });

    it('Imports recipes from query parameters', () => {
        // Arrange
        cy.intercept('https://proxy.example.com', { fixture: 'html/jaimies-hummus.html' });

        cy.visit('/recipes/create?from=https://recipes.example.com/hummus');
        cy.startApp({
            beforeMount(app) {
                const services = app.config.globalProperties as Services;

                services.$config.proxyUrl = 'https://proxy.example.com';
            },
        });

        // Act
        cy.ariaInput('Recipe name').clear().type('Houmous');
        cy.press('Create recipe');
        cy.press('Houmous', 'a');

        // Assert
        cy.url().should('contain', 'houmous');
        cy.see('Chickpeas – the star ingredient in houmous – are incredibly good for you.');
        cy.see('1 lemon');
        cy.see('recipe on recipes.example.com');
        cy.contains('h2', 'Instructions').next('ol').children().should('have.length', 7);

        cy.assertLocalDocumentEquals('solid://recipes/houmous', jaimiesHummusJsonLD);
    });

    it('Imports multiple recipes from the Web', () => {
        // Arrange
        cy.intercept('https://recipes.example.com/pisto', { fixture: 'html/pisto.html' });

        cy.see('How would you like to begin?');

        // Act
        cy.press('Create your first recipe');
        cy.press('Import from the Web');
        cy.toggleDetails('Advanced options');
        cy.details('Advanced options').within(() => {
            cy.get('input[type="checkbox"]').click();
        });
        cy.ariaInput('Website URL').type('https://recipes.example.com/pisto');
        cy.press('Scan');
        cy.see('We\'ve found more than one recipe');
        cy.contains('[role="radio"]', 'Pisto Manchego').click();
        cy.press('Import to my cookbook');
        cy.press('Create recipe');

        // Assert
        cy.see('Pisto Manchego', 'a');
        cy.dontSee('Marinated Olives');
        cy.press('Pisto Manchego');
        cy.url().should('contain', 'pisto-manchego');
        cy.see('1 hour');
        cy.see('Pisto Manchego With Olive Oil');
        cy.see('4 zucchini small, cubed');
        cy.see('recipe on recipes.example.com');
        cy.dontSee('Instructions');

        cy.assertLocalDocumentEquals('solid://recipes/pisto-manchego', pistoJsonLD);
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
        cy.ariaInput('Recipe name').clear().type('Houmous');
        cy.press('Create recipe');
        cy.press('Houmous', 'a');

        // Assert
        cy.url().should('contain', 'houmous');
        cy.see('Chickpeas – the star ingredient in houmous – are incredibly good for you.');
        cy.see('1 lemon');
        cy.see('recipe on recipes.example.com');
        cy.contains('h2', 'Instructions').next('ol').children().should('have.length', 7);

        cy.assertLocalDocumentEquals('solid://recipes/houmous', jaimiesHummusJsonLD);
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
        cy.ariaInput('Recipe name').clear().type('Jun\'s Ramen');
        cy.press('Create recipe');
        cy.press('Jun\'s Ramen', 'a');

        // Assert
        cy.url().should('contain', 'juns-ramen');
        cy.see('Cat Merch!');
        cy.see('recipe on recipes.example.com');
        cy.dontSee('Instructions');

        cy.assertLocalDocumentEquals('solid://recipes/juns-ramen', junsRamenJsonLD);
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
            cy.see('Unlisted', 'button');
            cy.ariaLabel('Umai').should('match', '[aria-checked="true"]');
            cy.see(`${Cypress.config('baseUrl')}/viewer?url=${ramen.getDocumentUrl()}`);

            cy.ariaLabel('Solid url').click();
            cy.ariaLabel('Solid url').should('match', '[aria-checked="true"]');
            cy.see(ramen.url);
        });
    });

    it('Deletes local recipes', () => {
        // Arrange
        cy.createFile('solid://recipes/ramen.png', 'img/ramen.png');
        cy.createRecipe({
            name: 'Ramen',
            imageUrls: ['solid://recipes/ramen.png'],
        }).as('ramen');

        // Act
        cy.press('Ramen');
        cy.press('Edit');
        cy.press('Delete');
        cy.press('Yes, delete recipe');

        // Assert
        cy.see('Ramen has been deleted');
        cy.assertLocalDocumentDoesNotExist('solid://recipes/ramen');
        cy.assertStoredFileDoesNotExist('solid://recipes/ramen.png');
    });

    it('Deletes remote recipes', () => {
        // Arrange
        cy.createRecipe({
            name: 'Ramen',
            imageUrls: ['http://localhost:4000/cookbook/ramen.png'],
        });
        cy.login({ hasCookbook: true });
        cy.request('http://localhost:4000/cookbook/ramen')
            .then(response => cy.wrap(response.body).as('ramenTurtle'));

        cy.intercept('PATCH', 'http://localhost:4000/cookbook/ramen').as('patchRamen');
        cy.intercept('DELETE', 'http://localhost:4000/cookbook/ramen.png').as('deleteRamenImage');

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
                    @prefix crdt: <https://vocab.noeldemartin.com/crdt/> .
                    @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

                    <#it-metadata>
                        a crdt:Tombstone ;
                        crdt:resource <#it> ;
                        crdt:deletedAt  "[[.*]]"^^xsd:dateTime .
                } .
            `);
        });
        cy.get('@deleteRamenImage').should('not.be.null');
        cy.assertLocalDocumentDoesNotExist('http://localhost:4000/cookbook/ramen');
    });

    it('Deletes recipes deleted remotely', () => {
        // Arrange
        cy.createRecipe({ name: 'Ramen' });
        cy.login({ hasCookbook: true });
        cy.createSolidDocumentAnonymously('/cookbook/ramen', 'recipes/tombstone.ttl');

        // Act
        cy.sync();

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

    it('Auto-links recipes', () => {
        // Arrange
        const seeDashi = () => {
            cy.see('A basic ingredient for Ramen');
            cy.dontSee('The best food ever');
        };
        const goBackToRamen = () => {
            cy.press('Ramen');
            cy.dontSee('A basic ingredient for Ramen');
        };

        cy.login();
        cy.createRecipe({
            name: 'Dashi',
            description: 'A basic ingredient for [Ramen](/recipes/ramen).',
            externalUrls: ['https://recipes.example.com/dashi'],
        });
        cy.createRecipe({
            name: 'Ramen',
            description: 'The best food ever.',
            ingredients: [
                '[Dashi (relative app url)](/recipes/dashi)',
                `[Dashi (hard-coded app url)](${Cypress.config('baseUrl')}/recipes/dashi)`,
                '[Dashi (resource id)](http://localhost:4000/cookbook/dashi#it)',
                '[Dashi (document url)](http://localhost:4000/cookbook/dashi)',
                '[Dashi (external url)](https://recipes.example.com/dashi)',
                '[Noodles](https://recipes.example.com/noodles)',
            ],
        }, [
            'Introduce the [Dashi](/recipes/dashi)',
            '???',
            'Profit',
        ]);

        cy.press('Ramen');
        cy.dontSee('New recipe');

        // Test relative urls
        cy.press('Dashi (relative app url)');

        seeDashi();
        goBackToRamen();

        // Test hard-coded urls
        cy.press('Dashi (hard-coded app url)');

        seeDashi();
        goBackToRamen();

        // Test resource id
        cy.press('Dashi (resource id)');

        seeDashi();
        goBackToRamen();

        // Test document url
        cy.press('Dashi (document url)');

        seeDashi();
        goBackToRamen();

        // Test external url
        cy.press('Dashi (external url)');

        seeDashi();
        goBackToRamen();

        // Test instructions
        cy.contains('Introduce the Dashi').within(() => cy.press('Dashi'));

        seeDashi();
        goBackToRamen();

        // Test other urls
        cy.press('Noodles');
        cy.service('$autoLinking')
            .then(AutoLinking => AutoLinking.hasCapturedDuringTesting('https://recipes.example.com/noodles'))
            .should('be.true');
    });

});
