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
        cy.press('online');
        cy.press('Synchronize now');

        // Assert.
        cy.see('Ramen');
    });

    it('Adds missing metadata to recipes', () => {
        // Arrange.
        cy.login();
        cy.createSolidDocument('/cookbook/ramen', 'recipes/ramen-bare.ttl');

        cy.intercept('PATCH', 'http://localhost:4000/cookbook/ramen').as('patchRamen');

        // Act.
        cy.press('online');
        cy.press('Synchronize now');

        // Assert.
        cy.see('Ramen');
        cy.see('Syncing is up to date');

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

});
