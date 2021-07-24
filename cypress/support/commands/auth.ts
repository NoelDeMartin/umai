import { arr } from '@noeldemartin/utils';

interface CSSAuthorizeOptions {
    resetPOD: boolean;
}

const queuedRequests = arr<{ url: string; options: RequestInit }>();

function cssLogin() {
    cy.get('#email').type('alice@example.com');
    cy.get('#password').type('secret');
    cy.contains('button', 'Log in').click();
}

function cssRegister() {
    cy.contains('Sign up').click();
    cy.get('#email').type('alice@example.com');
    cy.get('#password').type('secret');
    cy.get('#confirmPassword').type('secret');
    cy.get('#podName').type('alice');
    cy.contains('button', 'Sign up').click();
    cy.contains('log in').click();
}

function cssResetPOD() {
    cy.queueAuthenticatedRequest('http://localhost:4000/alice/profile/card', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/sparql-update' },
        body: `
            DELETE DATA {
                <http://localhost:4000/alice/profile/card#me>
                    <http://www.w3.org/ns/solid/terms#privateTypeIndex>
                    <http://localhost:4000/alice/settings/privateTypeIndex> .
            }
        `,
    });
    cy.queueAuthenticatedRequest('http://localhost:4000/alice/settings/privateTypeIndex', { method: 'DELETE' });
    cy.queueAuthenticatedRequest('http://localhost:4000/alice/cookbook/ramen', { method: 'DELETE' });
    cy.queueAuthenticatedRequest('http://localhost:4000/alice/cookbook/', { method: 'DELETE' });
}

export function queueAuthenticatedRequests(window: Window): void {
    queuedRequests.map(({ url, options }) => window.testing?.queueAuthenticatedRequest(url, options));
    queuedRequests.clear();
}

export default {

    cssAuthorize(options: Partial<CSSAuthorizeOptions> = {}): void {
        const requestOptions = {
            url: 'http://localhost:4000/alice/profile/card',
            failOnStatusCode: false,
        };

        cy.request(requestOptions).then(({ isOkStatusCode }) => {
            if (!isOkStatusCode) {
                cssRegister();
            }

            cssLogin();
        });

        if (options.resetPOD)
            cssResetPOD();
    },

    login(): void {
        // TODO use shortcut instead of logging in with the UI
        cy.intercept('https://alice.example.com', { statusCode: 404 });
        cy.intercept('https://alice.example.com/profile/card', { fixture: 'profile.ttl' });
        cy.prepareAnswer('Login url?', 'https://alice.example.com');
        cy.contains('Connect storage').click();
        cy.waitForReload();
    },

    queueAuthenticatedRequest(url: string, options: RequestInit): void {
        queuedRequests.push({ url, options });
    },

};
