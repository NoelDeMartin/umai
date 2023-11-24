function see(text: string, options?: Partial<Cypress.Timeoutable>): Cypress.Chainable;
function see(text: string, selector: string, options?: Partial<Cypress.Timeoutable>): Cypress.Chainable;
function see(
    text: string,
    selectorOrOptions: string | Partial<Cypress.Timeoutable> = {},
    options: Partial<Cypress.Timeoutable> = {},
): Cypress.Chainable {
    return typeof selectorOrOptions === 'string'
        ? cy.contains(selectorOrOptions, text, options).scrollIntoView().should('be.visible')
        : cy.a11yGet(text, selectorOrOptions).scrollIntoView().should('be.visible');
}

export default {

    a11yGet(text: string, options: Partial<Cypress.Timeoutable> = {}): Cypress.Chainable {
        return cy.contains(text, options);
    },

    ariaLabel(label: string): Cypress.Chainable {
        return cy.get(`[aria-label="${label}"]`);
    },

    ariaSelect(label: string): Cypress.Chainable {
        return cy.contains('label', label).get('select');
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

    press(label: string, selector: string = 'button:visible, a:visible, label:visible'): void {
        cy.contains(selector, label).click();
    },

    see,

    details(text: string): Cypress.Chainable {
        return cy.contains('summary', text).parent();
    },

    toggleDetails(text: string): void {
        cy.details(text).then(element => {
            const details = element.get(0);

            details.hasAttribute('open') ? details.removeAttribute('open') : details.setAttribute('open', '');
        });
    },

};
