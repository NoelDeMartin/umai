import aguachileJsonLD from '@cy/fixtures/recipes/aguachile.json';
import { cssPodUrl } from '@cy/support/commands/auth';

describe('Viewer', () => {

    it('Views public recipes', () => {
        // Arrange
        cy.intercept('https://pod.example.com/recipes/aguachile', { fixture: 'recipes/aguachile.ttl' });

        // Act
        cy.visit('viewer?url=https://pod.example.com/recipes/aguachile');
        cy.startApp();

        // Assert
        cy.see('Aguachile');
        cy.see('Aguachile ("chile water" in Spanish) is a Mexican dish');
        cy.see('Jalapeños');
        cy.see('Start by peeling the shrimps into a bowl');
    });

    it('Views public recipes using the form', () => {
        // Arrange
        cy.intercept('https://pod.example.com/recipes/aguachile', { fixture: 'recipes/aguachile.ttl' });

        // Act
        cy.visit('viewer');
        cy.startApp();
        cy.ariaInput('Solid document url').type('https://pod.example.com/recipes/aguachile');
        cy.press('Search');

        // Assert
        cy.see('Aguachile');
        cy.see('Aguachile ("chile water" in Spanish) is a Mexican dish');
        cy.see('Jalapeños');
        cy.see('Start by peeling the shrimps into a bowl');
    });

    it('Views all public recipes', () => {
        // Arrange
        cy.intercept('https://pod.example.com/alice/profile', {
            headers: { Link: '<http://www.w3.org/ns/pim/space#Storage>; rel="type"' },
            body: '',
        });
        cy.intercept('https://pod.example.com/alice/profile/card', { fixture: 'webids/alice.ttl' });
        cy.intercept('https://pod.example.com/recipes/ramen', { fixture: 'recipes/ramen.ttl' });
        cy.intercept('https://pod.example.com/recipes/pisto', { fixture: 'recipes/pisto.ttl' });
        cy.intercept('https://pod.example.com/recipes/public', { fixture: 'recipes/public.ttl' });

        cy.visit('viewer?url=https://pod.example.com/recipes/ramen');
        cy.startApp();

        // Act
        cy.see('Alice');
        cy.press('View more recipes');
        cy.press('Pisto');

        // Assert
        cy.see('Pisto is the same as Ratatouille!');
    });

    it('Views recipe lists', () => {
        // Arrange
        cy.intercept('https://pod.example.com/alice/profile', {
            headers: { Link: '<http://www.w3.org/ns/pim/space#Storage>; rel="type"' },
            body: '',
        });
        cy.intercept('https://pod.example.com/alice/profile/card', { fixture: 'webids/alice.ttl' });
        cy.intercept('https://pod.example.com/recipes/ramen', { fixture: 'recipes/ramen.ttl' });
        cy.intercept('https://pod.example.com/recipes/pisto', { fixture: 'recipes/pisto.ttl' });
        cy.intercept('https://pod.example.com/recipes/public', { fixture: 'recipes/public.ttl' }).as('getList');

        cy.visit('viewer');
        cy.startApp();

        // Act
        cy.ariaInput('Solid document url').type('https://pod.example.com/recipes/public');
        cy.press('Search');

        // Assert - View recipes
        cy.see('Alice');
        cy.see('Pisto');

        // Assert - Navigate
        cy.press('Pisto');
        cy.see('Pisto is the same as Ratatouille!');

        cy.get('header').within(() => cy.press('Alice\'s Public Recipes'));
        cy.press('Ramen');
        cy.see('Broth');

        cy.get('@getList.all').should('have.length', 1);
    });

    it('Views recipe containers', () => {
        // Arrange
        cy.intercept('GET', cssPodUrl('/cookbook/')).as('getContainer');

        cy.task('resetSolidPOD');
        cy.visit('viewer');
        cy.startApp();
        cy.createSolidDocument('/cookbook/ramen', 'recipes/ramen.ttl');
        cy.createSolidDocument('/cookbook/pisto', 'recipes/pisto.ttl');

        // Act
        cy.ariaInput('Solid document url').type(cssPodUrl('/cookbook/'));
        cy.press('Search');

        // Assert - View recipes
        cy.see('Ramen');
        cy.see('Pisto');

        // Assert - Navigate
        cy.press('Pisto');
        cy.see('Pisto is the same as Ratatouille!');

        cy.get('header').within(() => cy.press('Recipes'));
        cy.press('Ramen');
        cy.see('Broth');

        cy.get('@getContainer.all').should('have.length', 1);
    });

    it('Saves recipes in cookbook', () => {
        // Arrange
        cy.intercept('https://pod.example.com/recipes/aguachile', { fixture: 'recipes/aguachile.ttl' });
        cy.visit('viewer?url=https://pod.example.com/recipes/aguachile');
        cy.startApp();

        // Act
        cy.press('Save in my cookbook');

        // Assert
        cy.url().should('equal', `${Cypress.config('baseUrl')}/`);
        cy.assertLocalDocumentEquals('solid://recipes/aguachile', aguachileJsonLD);
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

        cy.intercept('https://pod.example.com/recipes/dashi', { fixture: 'recipes/dashi.ttl' });
        cy.intercept('https://pod.example.com/recipes/ramen', { fixture: 'recipes/dashi-ramen.ttl' }).as('ramen');
        cy.intercept('https://pod.example.com/recipes/public', { fixture: 'recipes/dashi-public.ttl' });
        cy.visit('viewer?url=https://pod.example.com/recipes/dashi');
        cy.startApp();

        cy.wait('@ramen');
        cy.waitTick();
        cy.press('Ramen');
        cy.dontSee('A basic ingredient for Ramen');

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
