import type { TestingRuntime, TestingStartOptions } from '@/types/testing';

import { queueAuthenticatedRequests } from './auth';

function patchWindow(window: Window): void {
    window.prompt = (_, defaultAnswer) => defaultAnswer ?? null;
}

export default {

    testingRuntime(): Cypress.Chainable<TestingRuntime> {
        return cy.window().its('testing').then(runtime => runtime as TestingRuntime);
    },

    startApp(options: Partial<TestingStartOptions> = {}): void {
        cy.window()
            .then((window: Window) => {
                patchWindow(window);
                queueAuthenticatedRequests(window);

                return Cypress.Promise.cast(window.testing?.start(options));
            })
            .then(reloaded => {
                if (!reloaded) {
                    return;
                }

                cy.press('Consent');
                cy.startApp(options);
            });

        cy.service('$errors').then((Errors) => Errors.disable());
        cy.contains('Something went wrong').should('not.exist');
    },

    waitForReload(options: Partial<TestingStartOptions> = {}): void {
        cy.get('#app.loading').then(() => cy.startApp(options));
    },

};
