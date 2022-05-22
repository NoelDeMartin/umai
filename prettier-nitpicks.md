- multi-line arrays (// hack)
- null coalescing returns
- padded-blocks for declarations
- padded-blocks for describe in tests
    - https://github.com/dangreenisrael/eslint-plugin-jest-formatting
- uneven indentation:
    cy.fixture('ramen.ttl').then(body =>
        cy.request({
            url: 'http://localhost:4000/cookbook/ramen',
            method: 'PUT',
            headers: { 'Content-Type': 'text/turtle' },
            body,
        }));
- ... (stopped reviewing changes on cypress/integration/viewer.spec.ts)
- Maybe write your own eslint plugin? https://twitter.com/antfu7/status/1510284385110888454
