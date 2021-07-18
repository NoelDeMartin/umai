let prompts: Record<string, string>;

const commands = {

    login(): void {
        // TODO use shortcut instead of logging in with the UI
        cy.intercept('https://alice.example.com', { statusCode: 404 });
        cy.intercept('https://alice.example.com/profile/card', { fixture: 'profile.ttl' });
        cy.prepareAnswer('Login url?', 'https://alice.example.com');
        cy.contains('Connect storage').click();
        cy.waitForReload();
    },

    prepareAnswer(question: string, answer: string): void {
        prompts[question] = answer;
    },

    resetPrompts(): void {
        prompts = {};
    },

    resetStorage(): void {
        indexedDB.deleteDatabase('soukai');
        indexedDB.deleteDatabase('soukai-meta');
    },

    startApp(): void {
        cy.window().then((window: Window) => {
            window.prompt = (question, defaultAnswer) => prompts[question ?? ''] ?? defaultAnswer ?? null;
            window.testing?.start();
        });
    },

    waitForReload(): void {
        cy.get('#app.loading').then(() => cy.startApp());
    },

};

type CustomCommands = typeof commands;

declare global {

    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable extends CustomCommands {}
    }

}

export default function installCustomCommands(): void {
    beforeEach(() => {
        cy.task('resetSolidPOD');
        cy.resetStorage();
        cy.resetPrompts();
    });

    for (const [name, implementation] of Object.entries(commands)) {
        Cypress.Commands.add(name, implementation);
    }

    Cypress.Commands.overwrite('reload', originalReload => {
        originalReload();
        cy.startApp();
    });
}
