import authCommands from './commands/auth';
import lifecycleCommands from './commands/lifecycle';
import storageCommands from './commands/storage';
import uiCommands from './commands/ui';

const commands = {
    ...authCommands,
    ...lifecycleCommands,
    ...storageCommands,
    ...uiCommands,
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
