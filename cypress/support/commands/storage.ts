import { jsonldToQuads, quadsToTurtle } from '@noeldemartin/solid-utils';
import { requireUrlParentDirectory } from '@noeldemartin/utils';
import { deleteDB, openDB } from 'idb';
import type Bluebird from 'cypress/types/bluebird';
import type { JsonLD } from '@noeldemartin/solid-utils';

async function getIndexedDBObject<T = object>(database: string, store: string, id: string): Promise<T> {
    const db = await openDB(database);
    const result = await db.get(store, id);

    db.close();

    return result;
}

export default {

    assertLocalDocumentEquals(documentId: string, expected: JsonLD): void {
        cy
            .getIndexedDBObject<JsonLD>('soukai', requireUrlParentDirectory(documentId), documentId)
            .then(actual => {
                Cypress.log({
                    name: 'assert',
                    message: 'comparing database documents',
                    consoleProps: () => ({ expected, actual }),
                });

                return actual;
            })
            .then(actual => {
                const promisedQuadArrays = [expected, actual].map(doc => jsonldToQuads(doc));

                return Cypress.Promise.all(promisedQuadArrays)
                    .then(quadArrays => quadArrays.map(quads => quadsToTurtle(quads)))
                    .then(([expectedTurtle, actualTurtle]) => expect(actualTurtle).to.be.turtle(expectedTurtle));
            });
    },

    resetStorage(): void {
        cy.window()
            .then(window => window.testing && Cypress.Promise.cast(window.testing.stop()))
            .then(success => success && Cypress.Promise.all([
                deleteDB('soukai'),
                deleteDB('soukai-meta'),
            ]));
    },

    getIndexedDBObject<T = object>(database: string, store: string, id: string): Bluebird<T> {
        return Cypress.Promise.cast(getIndexedDBObject<T>(database, store, id));
    },

};
