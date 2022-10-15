import { compare, objectWithoutEmpty } from '@noeldemartin/utils';

export type IngredientQuantity = number | [number, number];

export enum IngredientUnit {
    Grams = 'grams',
    Milliliters = 'milliliters',
}

export interface IngredientBreakdown {
    name: string;
    original: string;
    originalUnit?: string;
    quantity?: IngredientQuantity;
    unit?: IngredientUnit;
    unitMultiplier?: number;
}

type IngredientQuantityParser = (quantity: IngredientQuantity) => [IngredientQuantity, IngredientUnit, number];

const INGREDIENT_UNIT_QUANTITIES: Record<IngredientUnit, Record<string, number>> = {
    [IngredientUnit.Grams]: {
        g: 1,
        grams: 1,
        kg: 1000,
        kilograms: 1000,
    },
    [IngredientUnit.Milliliters]: {
        ml: 1,
        milliliters: 1,
        l: 1000,
        liters: 1000,
    },
};

const [INGREDIENT_REGEX, QUANTITY_RANGE_SEPARATOR_REGEX, QUANTITY_PARSERS] = initializeHelpers();

function compareIngredients(a: IngredientBreakdown, b: IngredientBreakdown): number {
    if (a.unit && !b.unit) return 1;
    if (!a.unit && b.unit) return -1;

    const aQuantity = Array.isArray(a.quantity) ? a.quantity[0] : a.quantity;
    const bQuantity = Array.isArray(b.quantity) ? b.quantity[0] : b.quantity;

    if (!aQuantity && !bQuantity) return compare(b.original, a.original);
    if (aQuantity && !bQuantity) return 1;
    if (!aQuantity && bQuantity) return -1;

    const quantityComparison = compare(aQuantity, bQuantity);

    return quantityComparison === 0 ? compare(b.original, a.original) : quantityComparison;
}

function initializeHelpers(): [RegExp, RegExp, Record<string, IngredientQuantityParser>] {
    const quantityRegex = '\\d[.,\\d]*';
    const quantityRangeSeparator = 'to|-|~';
    const quantityRangeRegex = `${quantityRegex}\\s*(?:${quantityRangeSeparator})\\s*${quantityRegex}`;
    const unitsRegex = Object
        .values(INGREDIENT_UNIT_QUANTITIES)
        .reduce((units, quantities) => [...units, Object.keys(quantities).join('|')], [] as string[])
        .join('|');

    return [
        new RegExp(`((?:${quantityRangeRegex})|(?:${quantityRegex}))\\s*(?:(${unitsRegex})\\s+)?(.*)`, 'i'),
        new RegExp(quantityRangeSeparator, 'i'),
        Object
            .entries(INGREDIENT_UNIT_QUANTITIES)
            .reduce((parsers, [unit, quantities]) => {
                Object.entries(quantities).forEach(([alias, multiplier]) => {
                    parsers[alias] = quantity => [
                        Array.isArray(quantity)
                            ? [quantity[0] * multiplier, quantity[1] * multiplier]
                            : quantity * multiplier,
                        unit as IngredientUnit,
                        multiplier,
                    ];
                });

                return parsers;
            }, {} as Record<string, IngredientQuantityParser>),
    ];
}

function parseIngredientQuantity(quantity?: string, unit?: string): [(IngredientQuantity)?, IngredientUnit?, number?] {
    if (!quantity)
        return [];

    const parsedQuantity = quantity.match(QUANTITY_RANGE_SEPARATOR_REGEX)
        ? quantity.split(QUANTITY_RANGE_SEPARATOR_REGEX).map(q => parseFloat(q.replace(',', '.'))) as [number, number]
        : parseFloat(quantity.replace(',', '.'));

    return QUANTITY_PARSERS[unit?.trim().toLowerCase() ?? '']?.(parsedQuantity) ?? [parsedQuantity];
}

export function parseIngredient(ingredient: string): IngredientBreakdown {
    const original = ingredient;
    const matches = ingredient.match(INGREDIENT_REGEX);
    const name = (matches?.[3] ?? ingredient).trim();
    const originalUnit = matches?.[2];
    const [quantity, unit, unitMultiplier] = parseIngredientQuantity(matches?.[1], originalUnit);

    return objectWithoutEmpty({
        name,
        original,
        originalUnit,
        quantity,
        unit,
        unitMultiplier,
    });
}

export function sortIngredients(ingredients: IngredientBreakdown[]): IngredientBreakdown[] {
    ingredients.sort((a, b) => compareIngredients(b, a));

    return ingredients;
}
