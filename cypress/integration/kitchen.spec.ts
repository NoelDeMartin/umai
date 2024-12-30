describe('Kitchen', () => {

    beforeEach(() => {
        cy.task('resetSolidPOD');
        cy.visit('/recipes?authenticator=localStorage');
        cy.startApp();
    });

    it('Cooks recipes', () => {
        // Arrange
        cy.createRecipe({
            name: 'Pa amb tomàquet',
            ingredients: ['Bread', '1 Tomato', 'Olive Oil'],
        }, [
            'Toast the bread.',
            'Slice a tomato in half, and spread it on the bread.',
            'Drizzle some olive oil on top.',
        ]);

        cy.press('Pa amb tomàquet');

        // Act & Assert - Ingredients
        cy.press('Let\'s cook!');
        cy.see('Mise en place');
        cy.see('Bread');
        cy.see('1 Tomato');
        cy.see('Olive Oil');

        // Act & Assert - Instructions
        cy.press('Next');
        cy.see('Step 1');
        cy.see('Toast the bread');

        cy.press('Next');
        cy.see('Step 2');
        cy.see('Slice a tomato in half');

        cy.press('Next');
        cy.see('Step 3');
        cy.see('Drizzle some olive oil on top');

        // Act & Assert - Finish
        cy.press('Next');
        cy.see('That\'s it!');
        cy.see('Congrats, you\'re done with the recipe!');
        cy.see('It seems like you don\'t have a picture');

        cy.press('Finish');
        cy.see('Pa amb tomàquet');
    });

    it('Dismisses the kitchen', () => {
        // Arrange
        cy.createRecipe({ name: 'Ramen' });
        cy.press('Ramen');

        // Act
        cy.press('not now');

        // Assert
        cy.dontSee('Let\'s cook!');

        cy.go('back');
        cy.press('Ramen');
        cy.wait(1000);
        cy.dontSee('Let\'s cook!');
    });

});
