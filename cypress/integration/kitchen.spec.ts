describe('Kitchen', () => {

    beforeEach(() => {
        cy.task('resetSolidPOD');
        cy.visit('/recipes?authenticator=localStorage');
        cy.startApp();
        cy.createRecipe({
            name: 'Pa amb tomàquet',
            ingredients: ['Bread', '1 Tomato', 'Olive Oil'],
        }, [
            'Toast the bread.',
            'Slice a tomato in half, and spread it on the bread.',
            'Drizzle some olive oil on top.',
        ]);
    });

    it('Cooks recipes', () => {
        // Arrange
        cy.press('Pa amb tomàquet');

        // Act & Assert - Ingredients
        cy.press('Let\'s cook this!');
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

    it('Uses timers', () => {
        // Arrange
        cy.press('Pa amb tomàquet');
        cy.press('Let\'s cook this!');
        cy.press('Next');
        cy.press('Show timers');

        // Act
        cy.press('Add timer');
        cy.contains('label', 'minutes').within(() => {
            cy.get('input').clear().type('0');
        });
        cy.contains('label', 'seconds').within(() => {
            cy.get('input').clear().type('3');
        });
        cy.press('Create');
        cy.press('Start');
        cy.see('Pause');
        cy.ariaLabel('Close the modal').click();
        cy.press('Close the kitchen');

        // Assert
        cy.see('Time\'s up!');
        cy.see('Timer 1');
    });

    it('Persists state', () => {
        // Arrange
        cy.press('Pa amb tomàquet');
        cy.press('Let\'s cook this!');
        cy.press('Bread');
        cy.press('Next');
        cy.press('Show timers');
        cy.press('Add timer');
        cy.press('Create');
        cy.ariaLabel('Close the modal').click();
        cy.press('Close the kitchen');

        // Act
        cy.reload();

        // Assert
        cy.press('Kitchen');
        cy.see('Step 1');

        cy.press('Show timers');
        cy.see('Timer 1');

        cy.ariaLabel('Close the modal').click();
        cy.press('Previous');

        cy.contains('label', 'Bread').within(() => {
            cy.get('input').should('match', ':checked');
        });
    });

    it('Dismisses the kitchen', () => {
        // Arrange
        cy.press('Pa amb tomàquet');

        // Act
        cy.press('not now');

        // Assert
        cy.dontSee('Let\'s cook this!');

        cy.go('back');
        cy.press('Pa amb tomàquet');
        cy.wait(1000);
        cy.dontSee('Let\'s cook this!');
    });

});
