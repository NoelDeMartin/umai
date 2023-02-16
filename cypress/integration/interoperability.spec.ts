import { cssPodUrl } from '@cy/support/commands/auth';

describe('Interoperability', () => {

    beforeEach(() => {
        cy.task('resetSolidPOD');
        cy.visit('/recipes?authenticator=localStorage');
        cy.startApp();
    });

    it('Reads recipes from nested containers', () => {
        // Arrange.
        cy.login();
        cy.createSolidDocument('/cookbook/nested/folder/ramen', 'recipes/ramen.ttl');

        // Act.
        cy.sync();

        // Assert.
        cy.see('Ramen');
    });

    it('Adds missing metadata to recipes', () => {
        // Arrange.
        cy.login();
        cy.createSolidDocument('/cookbook/ramen', 'recipes/ramen-bare.ttl');

        cy.intercept('PATCH', cssPodUrl('/cookbook/ramen')).as('patchRamen');

        // Act.
        cy.sync();

        // Assert.
        cy.see('Ramen');

        cy.fixture('sparql/mend-ramen-bare.sparql').then(sparql => {
            cy.get('@patchRamen').its('request.body').should('be.sparql', sparql);
        });
    });

    it('Handles recipes with multiple images', () => {
        // Arrange.
        cy.login();
        cy.createSolidDocument('/cookbook/ramen', 'recipes/ramen-gallery.ttl');
        cy.sync();

        cy.intercept('PUT', cssPodUrl('/cookbook/ramen-1.png')).as('putRamenImage');
        cy.intercept('PATCH', cssPodUrl('/cookbook/ramen')).as('patchRamen');

        // Act.
        cy.press('Ramen');
        cy.press('Edit');
        cy.press('Change image');
        cy.press('Remove image');
        cy.uploadFixture('Upload an image', 'img/ramen.png');
        cy.see('Remove image');
        cy.press('Update');
        cy.press('Save');

        // Assert.
        cy.wait('@putRamenImage');

        cy.get('@putRamenImage').its('request.headers.content-type').should('eq', 'image/png');
        cy.get('@patchRamen').should('be.null');
    });

    it('Mends recipe attributes', () => {
        // Arrange.
        cy.login();
        cy.createSolidDocument('/cookbook/ramen', 'recipes/ramen-malformed.ttl');

        cy.intercept('PATCH', cssPodUrl('/cookbook/ramen')).as('patchRamen');

        // Act.
        cy.sync();
        cy.press('Ramen');

        // Assert.
        cy.see('Ramen');
        cy.see('Step 1');
        cy.see('Step 2');
        cy.see('Step 3');
        cy.see('recipe on 1.example.com');
        cy.see('recipe on 2.example.com');

        cy.fixture('sparql/mend-ramen-malformed.sparql').then(sparql => {
            cy.get('@patchRamen').its('request.body').should('be.sparql', sparql);
        });
    });

    it('Reconciles remote changes without history', () => {
        // Arrange.
        cy.login();
        cy.createSolidDocument('/cookbook/ramen', 'recipes/ramen.ttl');
        cy.sync();
        cy.updateSolidDocument('/cookbook/ramen', 'sparql/update-ramen-without-history.sparql');

        cy.intercept('PATCH', cssPodUrl('/cookbook/ramen')).as('patchRamen');

        // Act.
        cy.press('Ramen');
        cy.sync();

        // Assert.
        cy.see('Ramen!');
        cy.see('Shiitake');
        cy.see('Step two');
        cy.dontSee('Broth');
        cy.dontSee('Step 2');

        cy.fixture('sparql/reconcile-ramen-history.sparql').then(sparql => {
            cy.get('@patchRamen').its('request.body').should('be.sparql', sparql);
        });
    });

    it('Works using RDF prefix aliases', () => {
        // Arrange
        cy.login();
        cy.createSolidDocument('/cookbook/ramen', 'recipes/ramen-http.ttl');

        cy.intercept('PATCH', cssPodUrl('/cookbook/ramen')).as('patchRamen');

        // Act
        cy.sync();
        cy.press('Ramen');
        cy.press('Edit');
        cy.press('Write a description');
        cy.currentElement().type('is life');
        cy.press('Save');
        cy.waitForSync();

        // Assert
        cy.see('Ramen');
        cy.see('is life');
        cy.see('Step 2');

        cy.fixture('sparql/update-ramen-http.sparql').then(sparql => {
            cy.get('@patchRamen').its('request.body').should('be.sparql', sparql);
        });
    });

    it('Registers existing containers in the type index', () => {
        // Arrange
        const registerCookbookReplacements = {
            resourceHash: '[[cookbook-registration][.*]]',
            cookbookUrl: cssPodUrl('/cookbook/'),
        };

        cy.createSolidContainerAnonymously('/cookbook/', 'Cookbook');
        cy.createSolidDocumentAnonymously('/cookbook/ramen', 'recipes/ramen.ttl');

        cy.intercept('PATCH', cssPodUrl('/settings/privateTypeIndex')).as('registerCookbook');

        // Act
        cy.login({ useExistingCookbook: true });

        // Assert
        cy.see('Ramen');

        cy.fixtureWithReplacements('sparql/register-cookbook.sparql', registerCookbookReplacements).then(sparql => {
            cy.get('@registerCookbook').its('request.body').should('be.sparql', sparql);
        });
    });

});
