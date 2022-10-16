import type { Services } from '@/framework/core';

export default {

    comeBackOnline(): void {
        cy.service('$network').then(network => network.online = true);
        cy.sync();
    },

    goOffline(): void {
        cy.service('$network').then(network => network.online = false);
    },

    service<T extends keyof Services>(name: T): Cypress.Chainable<Services[T]> {
        return cy.testingRuntime().then(runtime => runtime.getService(name));
    },

    sync(): void {
        cy.press('online');
        cy.press('Synchronize now');
        cy.waitSync();
    },

    waitSync(): void {
        cy.see('Syncing in progress');
        cy.see('Syncing is up to date');
    },

};
