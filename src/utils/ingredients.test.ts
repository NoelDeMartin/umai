import { IngredientUnit, parseIngredient, sortIngredients } from './ingredients';

describe('Ingredients helpers', () => {

    it('parses ingredients', () => {
        expect(parseIngredient('100g Cheese')).toEqual({
            name: 'Cheese',
            original: '100g Cheese',
            originalUnit: 'g',
            quantity: 100,
            unit: IngredientUnit.Grams,
            unitMultiplier: 1,
        });

        expect(parseIngredient('2kg Zucchini')).toEqual({
            name: 'Zucchini',
            original: '2kg Zucchini',
            originalUnit: 'kg',
            quantity: 2000,
            unit: IngredientUnit.Grams,
            unitMultiplier: 1000,
        });

        expect(parseIngredient('1,2L Milk')).toEqual({
            name: 'Milk',
            original: '1,2L Milk',
            originalUnit: 'L',
            quantity: 1200,
            unit: IngredientUnit.Milliliters,
            unitMultiplier: 1000,
        });

        expect(parseIngredient('3 Eggs')).toEqual({
            name: 'Eggs',
            original: '3 Eggs',
            quantity: 3,
        });

        expect(parseIngredient('3 to 6 Tomatoes')).toEqual({
            name: 'Tomatoes',
            original: '3 to 6 Tomatoes',
            quantity: [3, 6],
        });

        expect(parseIngredient('3 Lemons')).toEqual({
            name: 'Lemons',
            original: '3 Lemons',
            quantity: 3,
        });

        expect(parseIngredient('S&P')).toEqual({
            name: 'S&P',
            original: 'S&P',
        });
    });

    it('sorts ingredients', () => {
        const expectIngredientsOrder = (ingredients: string[], expected: string[]) => {
            const sortedIngredients = ingredients.map(parseIngredient);

            sortIngredients(sortedIngredients);

            expect(sortedIngredients.map(({ original }) => original)).toEqual(expected);
        };

        expectIngredientsOrder(
            [
                '1 Onion',
                'Black pepper',
                '1 Avocado',
                '200g Shrimps',
                'Crackers',
                'Cilantro',
                '1 Cucumber',
                'Mayonnaise',
                'Grated Garlic',
                '5 Lemons',
                'Jalapeños',
            ],
            [
                '200g Shrimps',
                '5 Lemons',
                '1 Avocado',
                '1 Cucumber',
                '1 Onion',
                'Black pepper',
                'Cilantro',
                'Crackers',
                'Grated Garlic',
                'Jalapeños',
                'Mayonnaise',
            ],
        );
    });

});
