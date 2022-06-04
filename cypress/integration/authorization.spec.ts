describe('Authorization', () => {

    beforeEach(() => {
        cy.visit('/?authenticator=inrupt');
        cy.startApp();
        cy.createRecipe({ name: 'Ramen' });
        cy.login({ authenticator: 'inrupt', hasCookbook: true });
    });

    it('Publishes recipes', () => {
        // Arrange
        cy.intercept('PATCH', 'http://localhost:4000/alice/cookbook/ramen.acl').as('patchACL');

        // Act
        cy.press('Ramen');
        cy.press('Share');
        cy.see('Private', 'button');
        cy.see('This recipe is private');
        cy.press('Private', 'button');
        cy.press('Public', 'li');

        // Assert
        cy.see('updating permissions');
        cy.see('Public', 'button');
        cy.dontSee('This recipe is private');

        cy.get('@patchACL.all').should('have.length', 2);
        cy.get('@patchACL.0').its('request.body').should('be.sparql', `
            INSERT DATA {
                @prefix acl: <http://www.w3.org/ns/auth/acl#> .

                <#owner>
                    a acl:Authorization ;
                    acl:agent <http://localhost:4000/alice/profile/card#me>, <mailto:alice@example.com> ;
                    acl:accessTo <http://localhost:4000/alice/cookbook/ramen> ;
                    acl:mode acl:Read, acl:Write, acl:Control .
            }
        `);
        cy.get('@patchACL.1').its('request.body').should('be.sparql', `
            INSERT DATA {
                @prefix acl: <http://www.w3.org/ns/auth/acl#> .
                @prefix foaf: <http://xmlns.com/foaf/0.1/> .

                <#public>
                    a acl:Authorization ;
                    acl:agentClass foaf:Agent ;
                    acl:accessTo <http://localhost:4000/alice/cookbook/ramen> ;
                    acl:mode acl:Read .
            }
        `);
    });

    it('Makes public recipes private', () => {
        // Arrange
        cy.intercept('PATCH', 'http://localhost:4000/alice/cookbook/ramen.acl').as('patchACL');
        cy.runAuthenticatedRequest('http://localhost:4000/alice/cookbook/ramen.acl', {
            method: 'PUT',
            headers: { 'Content-Type': 'text/turtle' },
            body: `
                @prefix acl: <http://www.w3.org/ns/auth/acl#> .
                @prefix foaf: <http://xmlns.com/foaf/0.1/> .

                <#public>
                    a acl:Authorization ;
                    acl:agentClass foaf:Agent ;
                    acl:accessTo <http://localhost:4000/alice/cookbook/ramen> ;
                    acl:mode acl:Read .

                <#owner>
                    a acl:Authorization ;
                    acl:agent <http://localhost:4000/alice/profile/card#me>, <mailto:alice@example.com> ;
                    acl:accessTo <http://localhost:4000/alice/cookbook/ramen> ;
                    acl:mode acl:Read, acl:Write, acl:Control .
            `,
        });

        // Act
        cy.press('Ramen');
        cy.press('Share');
        cy.see('Public', 'button');
        cy.dontSee('This recipe is private');
        cy.press('Public', 'button');
        cy.press('Private', 'li');

        // Assert
        cy.see('updating permissions');
        cy.see('Private');
        cy.see('This recipe is private');

        cy.get('@patchACL').its('request.body').should('be.sparql', `
            DELETE DATA {
                @prefix acl: <http://www.w3.org/ns/auth/acl#> .
                @prefix foaf: <http://xmlns.com/foaf/0.1/> .

                <#public>
                    a acl:Authorization ;
                    acl:agentClass foaf:Agent ;
                    acl:accessTo <http://localhost:4000/alice/cookbook/ramen> ;
                    acl:mode acl:Read .
            }
        `);
    });

    it('Makes private recipes public', () => {
        // Arrange
        cy.intercept('PATCH', 'http://localhost:4000/alice/cookbook/ramen.acl').as('patchACL');
        cy.runAuthenticatedRequest('http://localhost:4000/alice/cookbook/ramen.acl', {
            method: 'PUT',
            headers: { 'Content-Type': 'text/turtle' },
            body: `
                @prefix acl: <http://www.w3.org/ns/auth/acl#> .

                <#owner>
                    a acl:Authorization ;
                    acl:agent <http://localhost:4000/alice/profile/card#me>, <mailto:alice@example.com> ;
                    acl:accessTo <http://localhost:4000/alice/cookbook/ramen> ;
                    acl:mode acl:Read, acl:Write, acl:Control .
            `,
        });

        // Act
        cy.press('Ramen');
        cy.press('Share');
        cy.see('Private', 'button');
        cy.see('This recipe is private');
        cy.press('Private', 'button');
        cy.press('Public', 'li');

        // Assert
        cy.see('updating permissions');
        cy.see('Public', 'button');
        cy.dontSee('This recipe is private');

        cy.get('@patchACL').its('request.body').should('be.sparql', `
            INSERT DATA {
                @prefix acl: <http://www.w3.org/ns/auth/acl#> .
                @prefix foaf: <http://xmlns.com/foaf/0.1/> .

                <#public>
                    a acl:Authorization ;
                    acl:agentClass foaf:Agent ;
                    acl:accessTo <http://localhost:4000/alice/cookbook/ramen> ;
                    acl:mode acl:Read .
            }
        `);
    });

});
