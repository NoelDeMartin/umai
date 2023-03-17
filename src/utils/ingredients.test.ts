import { IngredientUnit, parseIngredient, sortIngredients } from './ingredients';
import type { IngredientBreakdown } from './ingredients';

function testParsingIngredients(
    raw: string,
    quantity: number | [number, number],
    expected: Omit<IngredientBreakdown, 'renderQuantity'> & { rendered: string },
): void {
    it(`parses ingredients [${raw}]`, () => {
        const { renderQuantity, ...actualIngredient } = parseIngredient(raw);
        const { rendered, ...expectedIngredient } = expected;

        expect(actualIngredient).toEqual(expectedIngredient);
        expect(renderQuantity(quantity)).toEqual(rendered);
    });
}

describe('Ingredients helpers', () => {

    testParsingIngredients('100g Cheese', 50, {
        template: '{quantity} Cheese',
        original: '100g Cheese',
        quantity: 100,
        unit: IngredientUnit.Grams,
        unitMultiplier: 1,
        rendered: '50g Cheese',
    });

    testParsingIngredients('2kg Zucchini', 3, {
        template: '{quantity} Zucchini',
        original: '2kg Zucchini',
        quantity: 2000,
        unit: IngredientUnit.Grams,
        unitMultiplier: 1000,
        rendered: '3kg Zucchini',
    });

    testParsingIngredients('1,2L Milk', 4, {
        template: '{quantity} Milk',
        original: '1,2L Milk',
        quantity: 1200,
        unit: IngredientUnit.Milliliters,
        unitMultiplier: 1000,
        rendered: '4L Milk',
    });

    testParsingIngredients('3 Eggs', 20, {
        template: '{quantity} Eggs',
        original: '3 Eggs',
        quantity: 3,
        rendered: '20 Eggs',
    });

    testParsingIngredients('3 to 6 Tomatoes', [6, 9], {
        template: '{quantity} Tomatoes',
        original: '3 to 6 Tomatoes',
        quantity: [3, 6],
        rendered: '6 - 9 Tomatoes',
    });

    testParsingIngredients('3 Lemons', 5, {
        template: '{quantity} Lemons',
        original: '3 Lemons',
        quantity: 3,
        rendered: '5 Lemons',
    });

    testParsingIngredients('S&P', 0, {
        template: 'S&P',
        original: 'S&P',
        rendered: 'S&P',
    });

    testParsingIngredients('¼ tbsp salt', .5, {
        template: '{quantity} salt',
        original: '¼ tbsp salt',
        quantity: 3.75,
        unit: IngredientUnit.Grams,
        unitMultiplier: 15,
        rendered: '½ tbsp salt',
    });

    testParsingIngredients('Zucchero 150 g', 50, {
        template: 'Zucchero {quantity}',
        original: 'Zucchero 150 g',
        quantity: 150,
        unit: IngredientUnit.Grams,
        unitMultiplier: 1,
        rendered: 'Zucchero 50g',
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
                '330ml Michelada (optional)',
                'Mayonnaise',
                'Grated Garlic',
                '5 Lemons',
                'Chipotle (optional)',
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
                '330ml Michelada (optional)',
                'Chipotle (optional)',
            ],
        );
    });

});
