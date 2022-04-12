import a11yCommands from './commands/a11y';
import appCommands from './commands/app';
import authCommands from './commands/auth';
import factoryCommands from './commands/factory';
import formsCommands from './commands/forms';
import lifecycleCommands from './commands/lifecycle';
import storageCommands from './commands/storage';

const commands = {
    ...a11yCommands,
    ...appCommands,
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
        Cypress.Commands.add(
            name as unknown as keyof Cypress.Chainable,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            implementation as Cypress.CommandFn<any>,
        );
    }

    Cypress.Commands.overwrite('reload', (originalReload, ...args) => {
        originalReload(...args);
        cy.startApp();
    });
}
