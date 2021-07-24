import type { TestingStartOptions } from '@/types/testing';

import { patchWindow } from './ui';
import { queueAuthenticatedRequests } from './auth';

export default {

    startApp(options: Partial<TestingStartOptions> = {}): void {
        cy.window().then((window: Window) => {
            patchWindow(window);
            queueAuthenticatedRequests(window);

            window.testing?.start(options);
        });
    },

    waitForReload(options: Partial<TestingStartOptions> = {}): void {
        cy.get('#app.loading').then(() => cy.startApp(options));
    },

};
