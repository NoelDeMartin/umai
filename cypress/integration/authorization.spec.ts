describe('Authorization', () => {

    beforeEach(() => {
        cy.visit('/?authenticator=inrupt');
        cy.startApp();
        cy.createRecipe({ name: 'Ramen' });
        cy.login({ authenticator: 'inrupt', hasCookbook: true });
    });

    it('Publishes recipes', () => {
        // Arrange
        const publicDocuments = ['ramen', 'public'];

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
        cy.see('Public', 'button');
        cy.dontSee('This recipe is private');

        cy.get('@createTypeIndex').should('not.be.null');
        cy.get('@createPublicList').its('request.body').should('be.sparql', `
            INSERT DATA {
                @prefix schema: <https://schema.org/> .
                @prefix purl: <http://purl.org/dc/terms/> .

                <#it>
                    a schema:ItemList ;
                    schema:name "Public Recipes" ;
                    purl:creator <http://localhost:4000/alice/profile/card#me> ;
                    schema:itemListElement <#[[item][%uuid%]]> .

                <#[[item][%uuid%]]>
                    a schema:ListItem ;
                    schema:item <http://localhost:4000/alice/cookbook/ramen#it> .
            }
        `);
        cy.get('@updateRamen').its('request.body').should('be.sparql', `
            DELETE DATA {
                @prefix crdt: <https://vocab.noeldemartin.com/crdt/> .
                @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

                <#it-metadata> crdt:updatedAt "[[createdAt][.*]]"^^xsd:dateTime .
            } ;
            INSERT DATA {
                @prefix schema: <https://schema.org/> .
                @prefix purl: <http://purl.org/dc/terms/> .
                @prefix crdt: <https://vocab.noeldemartin.com/crdt/> .
                @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

                <#it> purl:isReferencedBy <http://localhost:4000/alice/cookbook/public#it> .
                <#it-metadata> crdt:updatedAt "[[updatedAt][.*]]"^^xsd:dateTime .

                <#it-operation-[[name][%uuid%]]>
                    a crdt:SetPropertyOperation ;
                    crdt:resource <#it> ;
                    crdt:date "[[createdAt][.*]]"^^xsd:dateTime ;
                    crdt:property schema:name ;
                    crdt:value "Ramen" .

                <#it-operation-[[listing][%uuid%]]>
                    a crdt:AddPropertyOperation ;
                    crdt:resource <#it> ;
                    crdt:date "[[updatedAt][.*]]"^^xsd:dateTime ;
                    crdt:property purl:isReferencedBy ;
                    crdt:value <http://localhost:4000/alice/cookbook/public#it> .
            }
        `);

        publicDocuments.forEach(document => {
            cy.get(`@patch-${document}-ACL.all`).should('have.length', 2);
            cy.get(`@patch-${document}-ACL.0`).its('request.body').should('be.sparql', `
                INSERT DATA {
                    @prefix acl: <http://www.w3.org/ns/auth/acl#> .

                    <#owner>
                        a acl:Authorization ;
                        acl:agent <http://localhost:4000/alice/profile/card#me>, <mailto:alice@example.com> ;
                        acl:accessTo <http://localhost:4000/alice/cookbook/${document}> ;
                        acl:mode acl:Read, acl:Write, acl:Control .
                }
            `);
            cy.get(`@patch-${document}-ACL.1`).its('request.body').should('be.sparql', `
                INSERT DATA {
                    @prefix acl: <http://www.w3.org/ns/auth/acl#> .
                    @prefix foaf: <http://xmlns.com/foaf/0.1/> .

                    <#public>
                        a acl:Authorization ;
                        acl:agentClass foaf:Agent ;
                        acl:accessTo <http://localhost:4000/alice/cookbook/${document}> ;
                        acl:mode acl:Read .
                }
            `);
        });
    });

    it('Makes public recipes private', () => {
        // Arrange
        cy.createSolidDocument('/alice/cookbook/public', 'public-list-with-ramen.ttl');
        cy.createSolidDocument('/alice/settings/publicTypeIndex', 'public-type-index.ttl');
        cy.updateSolidDocument('/alice/profile/card', 'add-public-type-index.sparql');
        cy.createSolidDocument('/alice/cookbook/public.acl', 'public-acls.ttl', { document: 'public' });
        cy.createSolidDocument('/alice/cookbook/ramen.acl', 'public-acls.ttl', { document: 'ramen' });
        cy.service('$auth').then(Auth => Auth.refreshUserProfile());
        cy.getRecipe('ramen').then(ramen => ramen.update({
            listUrls: ['http://localhost:4000/alice/cookbook/public#it'],
        }));

        cy.sync();

        cy.intercept('PATCH', 'http://localhost:4000/alice/cookbook/ramen.acl').as('patchACL');
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
        cy.get('@patchRamen').its('request.body').should('be.sparql', `
            DELETE DATA {
                @prefix schema: <https://schema.org/> .
                @prefix purl: <http://purl.org/dc/terms/> .
                @prefix crdt: <https://vocab.noeldemartin.com/crdt/> .
                @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

                <#it> purl:isReferencedBy <http://localhost:4000/alice/cookbook/public#it> .
                <#it-metadata> crdt:updatedAt "[[.*]]"^^xsd:dateTime .
            } ;
            INSERT DATA {
                @prefix schema: <https://schema.org/> .
                @prefix purl: <http://purl.org/dc/terms/> .
                @prefix crdt: <https://vocab.noeldemartin.com/crdt/> .
                @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

                <#it-metadata> crdt:updatedAt "[[updatedAt][.*]]"^^xsd:dateTime .

                <#it-operation-[[listing][%uuid%]]>
                    a crdt:RemovePropertyOperation ;
                    crdt:resource <#it> ;
                    crdt:date "[[updatedAt][.*]]"^^xsd:dateTime ;
                    crdt:property purl:isReferencedBy ;
                    crdt:value <http://localhost:4000/alice/cookbook/public#it> .
            }
        `);
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
        cy.createSolidDocument('/alice/cookbook/public', 'public-list-empty.ttl');
        cy.createSolidDocument('/alice/settings/publicTypeIndex', 'public-type-index.ttl');
        cy.updateSolidDocument('/alice/profile/card', 'add-public-type-index.sparql');
        cy.createSolidDocument('/alice/cookbook/public.acl', 'public-acls.ttl', { document: 'public' });
        cy.createSolidDocument('/alice/cookbook/ramen.acl', 'private-acls.ttl', { document: 'ramen' });
        cy.service('$auth').then(Auth => Auth.refreshUserProfile());

        cy.intercept('PATCH', 'http://localhost:4000/alice/cookbook/ramen.acl').as('patchACL');
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
        cy.get('@patchRamen').its('request.body').should('be.sparql', `
            DELETE DATA {
                @prefix crdt: <https://vocab.noeldemartin.com/crdt/> .
                @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

                <#it-metadata> crdt:updatedAt "[[createdAt][.*]]"^^xsd:dateTime .
            } ;
            INSERT DATA {
                @prefix schema: <https://schema.org/> .
                @prefix purl: <http://purl.org/dc/terms/> .
                @prefix crdt: <https://vocab.noeldemartin.com/crdt/> .
                @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

                <#it> purl:isReferencedBy <http://localhost:4000/alice/cookbook/public#it> .
                <#it-metadata> crdt:updatedAt "[[updatedAt][.*]]"^^xsd:dateTime .

                <#it-operation-[[name][%uuid%]]>
                    a crdt:SetPropertyOperation ;
                    crdt:resource <#it> ;
                    crdt:date "[[createdAt][.*]]"^^xsd:dateTime ;
                    crdt:property schema:name ;
                    crdt:value "Ramen" .

                <#it-operation-[[listing][%uuid%]]>
                    a crdt:AddPropertyOperation ;
                    crdt:resource <#it> ;
                    crdt:date "[[updatedAt][.*]]"^^xsd:dateTime ;
                    crdt:property purl:isReferencedBy ;
                    crdt:value <http://localhost:4000/alice/cookbook/public#it> .
            }
        `);
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
