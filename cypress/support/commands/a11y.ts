export default {

    a11yGet(text: string): Cypress.Chainable {
        return cy.contains(text);
    },

    ariaLabel(label: string): Cypress.Chainable {
        return cy.get(`[aria-label="${label}"]`);
    },

    ariaInput(label: string): Cypress.Chainable {
        return cy.contains(label).then(matches => {
            const labelElement = (matches as unknown as HTMLElement[])[0];
            const inputElement = labelElement?.querySelector('input, textarea');

            return inputElement
                ? cy.wrap(inputElement)
                : cy.get(`#${labelElement?.getAttribute('for')}`);
        });
    },

    currentElement(): Cypress.Chainable {
        return cy.get(':focus');
    },

    dontSee(text: string): Cypress.Chainable {
        return cy.contains(text).should('not.exist');
    },

    press(label: string, selector: string = 'button, a, label'): void {
        cy.contains(selector, label).click();
    },

    see(text: string, selector: string | null = null): Cypress.Chainable {
        return selector
            ? cy.contains(selector, text).scrollIntoView().should('be.visible')
            : cy.a11yGet(text).scrollIntoView().should('be.visible');
    },

    toggleDetails(text: string): void {
        cy.contains('summary', text).parent().then(element => {
            const details = element.get(0);

            details.hasAttribute('open') ? details.removeAttribute('open') : details.setAttribute('open', '');
        });
    },

};
