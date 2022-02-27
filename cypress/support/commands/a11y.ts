export default {

    ariaInput(label: string): Cypress.Chainable {
        return cy.contains(label).then(matches => {
            const labelElement = (matches as unknown as HTMLElement[])[0];

            return cy.get(`#${labelElement.getAttribute('for')}`);
        });
    },

    see(text: string): void {
        cy.contains(text).should('be.visible');
    },

    toggleDetails(text: string): void {
        cy.contains('summary', text).parent().then(element => {
            const details = element.get(0);

            details.hasAttribute('open') ? details.removeAttribute('open') : details.setAttribute('open', '');
        });
    },

};
