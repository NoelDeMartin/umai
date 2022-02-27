/// <reference types="cypress" />

declare namespace Cypress {
	interface Chainable {
		fill(text: string): Chainable;
	}
}
