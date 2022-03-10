import { arr, stringToSlug } from '@noeldemartin/utils';

interface ResetOptions {
    typeIndex: boolean;
    cookbook: boolean;
    recipe: string;
}

interface CSSAuthorizeOptions {
    reset: boolean | Partial<ResetOptions>;
}

const cssPodUrl = 'http://localhost:4000';
const queuedRequests = arr<{ url: string; options: RequestInit }>();

function cssLogin() {
    cy.get('#email').type('alice@example.com');
    cy.get('#password').type('secret');
    cy.contains('button', 'Log in').click();
    cy.contains('button', 'Consent').click();
}

function cssRegister() {
    cy.contains('Sign up').click();
    cy.get('#email').type('alice@example.com');
    cy.get('#password').type('secret');
    cy.get('#confirmPassword').type('secret');
    cy.get('#podName').type('alice');
    cy.contains('button', 'Sign up').click();
    cy.contains('a', 'log in').click();
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

        if (options.reset)
            cy.cssReset(typeof options.reset === 'object' ? options.reset : {});
    },

    cssReset(options: Partial<ResetOptions> = {}): void {
        // Delete previous data
        cy.queueUpdatingSolidDocument('/alice/profile/card', 'remove-type-index.sparql');
        cy.queueDeletingSolidDocument('/alice/settings/privateTypeIndex');
        cy.queueDeletingSolidDocument('/alice/cookbook/ramen');
        cy.queueDeletingSolidDocument('/alice/cookbook/pisto');
        cy.queueDeletingSolidDocument('/alice/cookbook/');

        // Create new data
        if (options.typeIndex) {
            cy.queueCreatingSolidDocument('/alice/settings/privateTypeIndex', 'type-index.ttl');
            cy.queueUpdatingSolidDocument('/alice/profile/card', 'add-type-index.sparql');
        }

        if (options.typeIndex && options.cookbook) {
            cy.queueCreatingSolidContainer('/alice/', 'Cookbook');
            cy.queueUpdatingSolidDocument('/alice/settings/privateTypeIndex', 'register-cookbook.sparql');
        }

        if (options.typeIndex && options.cookbook && options.recipe) {
            cy.queueCreatingSolidDocument(`/alice/cookbook/${options.recipe}`, `${options.recipe}.ttl`);
        }
    },

    login(): void {
        // TODO use shortcut instead of logging in with the UI
        cy.intercept('https://alice.example.com', { statusCode: 404 });
        cy.intercept('https://alice.example.com/profile/card', { fixture: 'profile.ttl' });
        cy.contains('disconnected').click();
        cy.ariaInput('Login url').type('https://alice.example.com{enter}');
        cy.waitForReload();
        cy.contains('online').should('be.visible');
        cy.contains('Go ahead').click();
    },

    queueAuthenticatedRequest(url: string, options: RequestInit): void {
        queuedRequests.push({ url, options });
    },

    queueCreatingSolidContainer(parentUrl: string, name: string): void {
        cy.queueAuthenticatedRequest(cssPodUrl + parentUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/turtle',
                'Link': '<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"',
                'Slug': stringToSlug(name),
            },
            body: `<> <http://www.w3.org/2000/01/rdf-schema#label> "${name}" .`,
        });
    },

    queueCreatingSolidDocument(url: string, fixture: string): void {
        cy.fixture(fixture).then(body => {
            cy.queueAuthenticatedRequest(cssPodUrl + url, {
                method: 'PUT',
                headers: { 'Content-Type': 'text/turtle' },
                body,
            });
        });
    },

    queueDeletingSolidDocument(url: string): void {
        cy.queueAuthenticatedRequest(cssPodUrl + url, { method: 'DELETE' });
    },

    queueUpdatingSolidDocument(url: string, fixture: string): void {
        cy.fixture(fixture).then(body => {
            cy.queueAuthenticatedRequest(cssPodUrl + url, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/sparql-update' },
                body,
            });
        });
    },

};
