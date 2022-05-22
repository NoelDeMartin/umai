import type { Services } from '@/framework/core';

export default {
    comeBackOnline(): void {
        cy.service('$network').then(network => (network.online = true));
        cy.press('online');
        cy.press('Synchronize now');
        cy.contains('Syncing is up to date');
    },

    goOffline(): void {
        cy.service('$network').then(network => (network.online = false));
    },

    service<T extends keyof Services>(name: T): Cypress.Chainable<Services[T]> {
        return cy.testingRuntime().then(runtime => runtime.getService(name));
    },
};
