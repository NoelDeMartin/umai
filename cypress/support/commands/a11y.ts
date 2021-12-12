export default {

    ariaInput(label: string): Cypress.Chainable {
        return cy.contains(label).then(matches => {
            const labelElement = (matches as unknown as HTMLElement[])[0];

            return cy.get(`#${labelElement.getAttribute('for')}`);
        });
    },

};
