function createACLSparql(document: string): string {
    return `
        INSERT DATA {
            @prefix acl: <http://www.w3.org/ns/auth/acl#> .

            <#owner>
                a acl:Authorization ;
                acl:agent <http://localhost:4000/alice/profile/card#me>, <mailto:alice@example.com> ;
                acl:accessTo <http://localhost:4000/alice/cookbook/${document}> ;
                acl:mode acl:Read, acl:Write, acl:Control .
        }
    `;
}

function publishACLSparql(document: string): string {
    return `
        INSERT DATA {
            @prefix acl: <http://www.w3.org/ns/auth/acl#> .
            @prefix foaf: <http://xmlns.com/foaf/0.1/> .

            <#public>
                a acl:Authorization ;
                acl:agentClass foaf:Agent ;
                acl:accessTo <http://localhost:4000/alice/cookbook/${document}> ;
                acl:mode acl:Read .
        }
    `;
}

function unpublishACLSparql(document: string): string {
    return `
        DELETE DATA {
            @prefix acl: <http://www.w3.org/ns/auth/acl#> .
            @prefix foaf: <http://xmlns.com/foaf/0.1/> .

            <#public>
                a acl:Authorization ;
                acl:agentClass foaf:Agent ;
                acl:accessTo <http://localhost:4000/alice/cookbook/${document}> ;
                acl:mode acl:Read .
        }
    `;
}

describe('Authorization', () => {

    beforeEach(() => {
        cy.visit('/?authenticator=inrupt');
        cy.startApp();
        cy.createRecipe({
            name: 'Ramen',
            imageUrls: ['http://localhost:4000/alice/cookbook/ramen.png'],
        });
        cy.login({ authenticator: 'inrupt', hasCookbook: true });
        cy.uploadFile('http://localhost:4000/alice/cookbook/ramen.png', 'img/ramen.png');
    });

    it('Publishes recipes', () => {
        // Arrange
        const publicDocuments = ['ramen', 'ramen.png', 'public'];

        cy.intercept('PATCH', 'http://localhost:4000/alice/settings/publicTypeIndex').as('createTypeIndex');
        cy.intercept('PATCH', 'http://localhost:4000/alice/cookbook/public').as('createPublicList');
        cy.intercept('PATCH', 'http://localhost:4000/alice/cookbook/ramen').as('updateRamen');

        publicDocuments.forEach(acl => {
            cy.intercept('PATCH', `http://localhost:4000/alice/cookbook/${acl}.acl`).as(`patch-${acl}-ACL`);
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
        cy.see('Public', 'button', { timeout: 10000 });
        cy.dontSee('This recipe is private');

        cy.get('@createTypeIndex').should('not.be.null');
        cy.fixture('sparql/create-recipes-list.sparql').then(sparql => {
            cy.get('@createPublicList').its('request.body').should('be.sparql', sparql);
        });
        cy.fixture('sparql/publish-ramen.sparql').then(sparql => {
            cy.get('@updateRamen').its('request.body').should('be.sparql', sparql);
        });

        publicDocuments.forEach(document => {
            cy.get(`@patch-${document}-ACL.all`).should('have.length', 2);
            cy.get(`@patch-${document}-ACL.0`).its('request.body').should('be.sparql', createACLSparql(document));
            cy.get(`@patch-${document}-ACL.1`).its('request.body').should('be.sparql', publishACLSparql(document));
        });
    });

    it('Publishes unlisted recipes', () => {
        // Arrange
        const publicDocuments = ['ramen', 'ramen.png'];

        cy.intercept('PATCH', 'http://localhost:4000/alice/settings/publicTypeIndex').as('createTypeIndex');
        cy.intercept('PATCH', 'http://localhost:4000/alice/cookbook/public').as('createPublicList');
        cy.intercept('PATCH', 'http://localhost:4000/alice/cookbook/ramen').as('updateRamen');

        publicDocuments.forEach(acl => {
            cy.intercept('PATCH', `http://localhost:4000/alice/cookbook/${acl}.acl`).as(`patch-${acl}-ACL`);
        });

        // Act
        cy.press('Ramen');
        cy.press('Share');
        cy.see('Private', 'button');
        cy.see('This recipe is private');
        cy.press('Private', 'button');
        cy.press('Unlisted', 'li');

        // Assert
        cy.see('updating permissions');
        cy.see('Unlisted', 'button', { timeout: 10000 });
        cy.dontSee('This recipe is private');

        publicDocuments.forEach(document => {
            cy.get(`@patch-${document}-ACL.all`).should('have.length', 2);
            cy.get(`@patch-${document}-ACL.0`).its('request.body').should('be.sparql', createACLSparql(document));
            cy.get(`@patch-${document}-ACL.1`).its('request.body').should('be.sparql', publishACLSparql(document));
        });

        cy.get('@createTypeIndex').should('be.null');
        cy.get('@createPublicList').should('be.null');
        cy.get('@updateRamen').should('be.null');
    });

    it('Makes public recipes private', () => {
        // Arrange
        cy.createSolidDocument('/alice/cookbook/public', 'turtle/public-list-with-ramen.ttl');
        cy.createSolidDocument('/alice/settings/publicTypeIndex', 'turtle/public-type-index.ttl');
        cy.updateSolidDocument('/alice/profile/card', 'sparql/add-public-type-index.sparql');
        cy.createSolidDocument('/alice/cookbook/public.acl', 'turtle/public-acls.ttl', { document: 'public' });
        cy.createSolidDocument('/alice/cookbook/ramen.acl', 'turtle/public-acls.ttl', { document: 'ramen' });
        cy.createSolidDocument('/alice/cookbook/ramen.png.acl', 'turtle/public-acls.ttl', { document: 'ramen.png' });
        cy.service('$auth').then(Auth => Auth.refreshUserProfile());
        cy.getRecipe('ramen').then(ramen => ramen.update({
            listUrls: ['http://localhost:4000/alice/cookbook/public#it'],
        }));

        cy.sync();

        cy.intercept('PATCH', 'http://localhost:4000/alice/cookbook/ramen.acl').as('patchRamenACL');
        cy.intercept('PATCH', 'http://localhost:4000/alice/cookbook/ramen.png.acl').as('patchImageACL');
        cy.intercept('PATCH', 'http://localhost:4000/alice/cookbook/ramen').as('patchRamen');
        cy.intercept('PATCH', 'http://localhost:4000/alice/cookbook/public').as('patchList');

        // Act
        cy.press('Ramen');
        cy.press('Share');
        cy.see('Public', 'button');
        cy.dontSee('This recipe is private');
        cy.press('Public', 'button');
        cy.press('Private', 'li');

        // Assert
        cy.see('updating permissions');
        cy.see('Private', { timeout: 10000 });
        cy.see('This recipe is private');

        cy.get('@patchRamenACL').its('request.body').should('be.sparql', unpublishACLSparql('ramen'));
        cy.get('@patchImageACL').its('request.body').should('be.sparql', unpublishACLSparql('ramen.png'));
        cy.fixture('sparql/unpublish-ramen.sparql').then(sparql => {
            cy.get('@patchRamen').its('request.body').should('be.sparql', sparql);
        });
        cy.get('@patchList').its('request.body').should('be.sparql', `
            DELETE DATA {
                @prefix schema: <https://schema.org/> .

                <#it> schema:itemListElement <#ramen> .

                <#ramen>
                    a schema:ListItem ;
                    schema:item <http://localhost:4000/alice/cookbook/ramen#it> .
            }
        `);
    });

    it('Makes private recipes public', () => {
        // Arrange
        cy.createSolidDocument('/alice/cookbook/public', 'turtle/public-list-empty.ttl');
        cy.createSolidDocument('/alice/settings/publicTypeIndex', 'turtle/public-type-index.ttl');
        cy.updateSolidDocument('/alice/profile/card', 'sparql/add-public-type-index.sparql');
        cy.createSolidDocument('/alice/cookbook/public.acl', 'turtle/public-acls.ttl', { document: 'public' });
        cy.createSolidDocument('/alice/cookbook/ramen.acl', 'turtle/private-acls.ttl', { document: 'ramen' });
        cy.createSolidDocument('/alice/cookbook/ramen.png.acl', 'turtle/private-acls.ttl', { document: 'ramen.png' });
        cy.service('$auth').then(Auth => Auth.refreshUserProfile());

        cy.intercept('PATCH', 'http://localhost:4000/alice/cookbook/ramen.acl').as('patchRamenACL');
        cy.intercept('PATCH', 'http://localhost:4000/alice/cookbook/ramen.png.acl').as('patchImageACL');
        cy.intercept('PATCH', 'http://localhost:4000/alice/cookbook/ramen').as('patchRamen');
        cy.intercept('PATCH', 'http://localhost:4000/alice/cookbook/public').as('patchList');

        // Act
        cy.press('Ramen');
        cy.press('Share');
        cy.see('Private', 'button');
        cy.see('This recipe is private');
        cy.press('Private', 'button');
        cy.press('Public', 'li');

        // Assert
        cy.see('updating permissions');
        cy.see('Public', 'button', { timeout: 10000 });
        cy.dontSee('This recipe is private');

        cy.get('@patchRamenACL').its('request.body').should('be.sparql', publishACLSparql('ramen'));
        cy.get('@patchImageACL').its('request.body').should('be.sparql', publishACLSparql('ramen.png'));
        cy.fixture('sparql/publish-ramen.sparql').then(sparql => {
            cy.get('@patchRamen').its('request.body').should('be.sparql', sparql);
        });
        cy.get('@patchList').its('request.body').should('be.sparql', `
            INSERT DATA {
                @prefix schema: <https://schema.org/> .

                <#it> schema:itemListElement <#[[ramen][%uuid%]]> .

                <#[[ramen][%uuid%]]>
                    a schema:ListItem ;
                    schema:item <http://localhost:4000/alice/cookbook/ramen#it> .
            }
        `);
    });

});
