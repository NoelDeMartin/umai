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

        cy.intercept('PATCH', 'http://localhost:4000/cookbook/ramen').as('patchRamen');

        // Act.
        cy.sync();

        // Assert.
        cy.see('Ramen');

        cy.get('@patchRamen').its('request.body').should('be.sparql', `
            INSERT DATA {
                @prefix crdt: <https://vocab.noeldemartin.com/crdt/> .
                @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

                <#it-metadata>
                    a crdt:Metadata ;
                    crdt:resource <#it> ;
                    crdt:createdAt  "[[date][.*]]"^^xsd:dateTime ;
                    crdt:updatedAt  "[[date][.*]]"^^xsd:dateTime .
            } .
        `);
    });

    it('Handles recipes with multiple images', () => {
        // Arrange.
        cy.login();
        cy.createSolidDocument('/cookbook/ramen', 'recipes/ramen-gallery.ttl');
        cy.sync();

        cy.intercept('PUT', 'http://localhost:4000/cookbook/ramen-1.png').as('putRamenImage');
        cy.intercept('PATCH', 'http://localhost:4000/cookbook/ramen').as('patchRamen');

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

});
