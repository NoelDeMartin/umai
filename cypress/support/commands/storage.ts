import { jsonldToQuads, quadsToTurtle } from '@noeldemartin/solid-utils';
import { requireUrlParentDirectory } from '@noeldemartin/utils';
import { deleteDB, openDB } from 'idb';
import type Bluebird from 'cypress/types/bluebird';
import type { JsonLD } from '@noeldemartin/solid-utils';

const MIME_TYPE_EXTENSIONS: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.json': 'application/json',
    '.jsonld': 'application/json',
};

async function createIndexedDBObject(database: string, store: string, record: object): Promise<void> {
    // TODO refactor this to remove duplication
    const db = await openDB(database, 1, {
        upgrade(db) {
            if (db.objectStoreNames.contains('files')) {
                return;
            }

            db.createObjectStore('files', { keyPath: 'url' });
        },
    });

    await db.put(store, record);

    db.close();
}

async function deleteIndexedDBDatabase(database: string): Promise<void> {
    return new Promise(resolve => deleteDB(database, { blocked: resolve }).then(resolve));
}

function getFileMimeType(filename: string): string {
    const extensionMatch = Object
        .keys(MIME_TYPE_EXTENSIONS)
        .find(extension => filename.toLowerCase().endsWith(extension));

    return MIME_TYPE_EXTENSIONS[extensionMatch ?? ''] ?? 'text/plain';
}

async function getIndexedDBObject<T = object>(database: string, store: string, id: string): Promise<T | null> {
    try {
        const db = await openDB(database);
        const result = await db.get(store, id);

        db.close();

        return result ?? null;
    } catch (error) {
        return null;
    }
}

export default {

    assertLocalDocumentDoesNotExist(documentId: string): void {
        cy.getIndexedDBObject<JsonLD>('soukai', requireUrlParentDirectory(documentId), documentId)
            .then(document => expect(document).to.be.null);
    },

    assertLocalDocumentEquals(documentId: string, expected: JsonLD): void {
        cy
            .getIndexedDBObject<JsonLD>('soukai', requireUrlParentDirectory(documentId), documentId)
            .then(actual => {
                expect(actual).not.to.be.null;

                Cypress.log({
                    name: 'assert',
                    message: 'comparing database documents',
                    consoleProps: () => ({ expected, actual }),
                });

                const promisedQuadArrays = [expected, actual as JsonLD].map(doc => jsonldToQuads(doc));

                return Cypress.Promise.all(promisedQuadArrays)
                    .then(quadArrays => quadArrays.map(quads => quadsToTurtle(quads)))
                    .then(([expectedTurtle, actualTurtle]) => expect(actualTurtle).to.be.turtle(expectedTurtle ?? ''));
            });
    },

    assertLocalDocumentExists(documentId: string): void {
        cy.getIndexedDBObject<JsonLD>('soukai', requireUrlParentDirectory(documentId), documentId)
            .then(document => expect(document).not.to.be.null);
    },

    resetStorage(): void {
        cy.window()
            .then(window => window.testing && Cypress.Promise.cast(window.testing.stop()))
            .then(success => success && Cypress.Promise.all([
                deleteIndexedDBDatabase('app'),
                deleteIndexedDBDatabase('soukai'),
                deleteIndexedDBDatabase('soukai-meta'),
            ]));
    },

    assertStoredFileDoesNotExist(url: string): void {
        cy.getIndexedDBObject<JsonLD>('app', 'files', url)
            .then(document => expect(document).to.be.null);
    },

    assertStoredFileMatches(url: string, expected: Record<string, unknown>): void {
        cy
            .getIndexedDBObject<JsonLD>('app', 'files', url)
            .then(actual => {
                expect(actual).not.to.be.null;

                Cypress.log({
                    name: 'assert',
                    message: 'comparing stored files',
                    consoleProps: () => ({ expected, actual }),
                });

                expect(actual).to.contain(expected);
            });
    },

    createFile(url: string, fixture: string): void {
        cy.fixtureBlob(fixture).then(({ blob, mimeType }) => {
            return createIndexedDBObject('app', 'files', {
                url,
                mimeType,
                blob,
                dirty: true,
                expiresAt: new Date(Date.now() + 10000000),
            });
        });
    },

    fixtureWithReplacements(filename: string, replacements: Record<string, unknown>): Cypress.Chainable<string> {
        return cy.fixture(filename).then(text => {
            return Object
                .entries(replacements)
                .reduce((text, [name, value]) => text.replaceAll(`{{${name}}}`, value), text);
        });
    },

    fixtureBlob(filename: string): Cypress.Chainable<{ blob: Blob; mimeType: string }> {
        return cy.fixture(filename).then(content => {
            const mimeType = getFileMimeType(filename);

            if (mimeType === 'application/json')
                content = btoa(content);

            return {
                blob: Cypress.Blob.base64StringToBlob(content, mimeType),
                mimeType,
            };
        });
    },

    getIndexedDBObject<T = object>(database: string, store: string, id: string): Bluebird<T | null> {
        return Cypress.Promise.cast(getIndexedDBObject<T>(database, store, id));
    },

};
