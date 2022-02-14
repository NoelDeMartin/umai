import a11yCommands from './commands/a11y';
import authCommands from './commands/auth';
import factoryCommands from './commands/factory';
import formsCommands from './commands/forms';
import lifecycleCommands from './commands/lifecycle';
import storageCommands from './commands/storage';

const commands = {
    ...a11yCommands,
    ...authCommands,
    ...factoryCommands,
    ...formsCommands,
    ...lifecycleCommands,
    ...storageCommands,
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
    });

    for (const [name, implementation] of Object.entries(commands)) {
        Cypress.Commands.add(name, implementation);
    }

    Cypress.Commands.overwrite('reload', originalReload => {
        originalReload();
        cy.startApp();
    });
}
