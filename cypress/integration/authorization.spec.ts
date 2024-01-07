import { createACLSparql, cssPodUrl, publishACLSparql, unpublishACLSparql } from '@cy/support/commands/auth';

describe('Authorization', () => {

    beforeEach(() => {
        cy.visit('/?authenticator=inrupt');
        cy.startApp();
        cy.createRecipe({
            name: 'Ramen',
            imageUrls: [cssPodUrl('/alice/cookbook/ramen.png')],
        });
        cy.login({ authenticator: 'inrupt', hasCookbook: true });
        cy.uploadFile(cssPodUrl('/alice/cookbook/ramen.png'), 'img/ramen.png');
    });

    it('Publishes recipes', () => {
        // Arrange
        const publicDocuments = ['ramen', 'ramen.png', 'public'];

        cy.intercept('PATCH', cssPodUrl('/alice/settings/publicTypeIndex')).as('createTypeIndex');
        cy.intercept('PATCH', cssPodUrl('/alice/cookbook/public')).as('createPublicList');
        cy.intercept('PATCH', cssPodUrl('/alice/cookbook/ramen')).as('updateRamen');

        publicDocuments.forEach(acl => {
            cy.intercept('PATCH', cssPodUrl(`/alice/cookbook/${acl}.acl`)).as(`patch-${acl}-ACL`);
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

        cy.intercept('PATCH', cssPodUrl('/alice/settings/publicTypeIndex')).as('createTypeIndex');
        cy.intercept('PATCH', cssPodUrl('/alice/cookbook/public')).as('createPublicList');
        cy.intercept('PATCH', cssPodUrl('/alice/cookbook/ramen')).as('updateRamen');

        publicDocuments.forEach(acl => {
            cy.intercept('PATCH', cssPodUrl(`/alice/cookbook/${acl}.acl`)).as(`patch-${acl}-ACL`);
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
            listUrls: [cssPodUrl('/alice/cookbook/public#it')],
        }));

        cy.sync();

        cy.intercept('PATCH', cssPodUrl('/alice/cookbook/ramen.acl')).as('patchRamenACL');
        cy.intercept('PATCH', cssPodUrl('/alice/cookbook/ramen.png.acl')).as('patchImageACL');
        cy.intercept('PATCH', cssPodUrl('/alice/cookbook/ramen')).as('patchRamen');
        cy.intercept('PATCH', cssPodUrl('/alice/cookbook/public')).as('patchList');

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
                    schema:item <${cssPodUrl('/alice/cookbook/ramen#it')}> .
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

        cy.intercept('PATCH', cssPodUrl('/alice/cookbook/ramen.acl')).as('patchRamenACL');
        cy.intercept('PATCH', cssPodUrl('/alice/cookbook/ramen.png.acl')).as('patchImageACL');
        cy.intercept('PATCH', cssPodUrl('/alice/cookbook/ramen')).as('patchRamen');
        cy.intercept('PATCH', cssPodUrl('/alice/cookbook/public')).as('patchList');

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
                    schema:item <${cssPodUrl('/alice/cookbook/ramen#it')}> .
            }
        `);
    });

});
