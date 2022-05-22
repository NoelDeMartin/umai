import { compare, objectWithoutEmpty } from '@noeldemartin/utils';

export type IngredientQuantity = number | [number, number];

export enum IngredientUnit {
    Grams = 'grams',
    Milliliters = 'milliliters',
}

export interface IngredientBreakdown {
    name: string;
    original: string;
    quantity?: IngredientQuantity;
    unit?: IngredientUnit;
}

type IngredientQuantityParser = (quantity: IngredientQuantity) => [IngredientQuantity, IngredientUnit];

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
    const unitsRegex = Object.values(INGREDIENT_UNIT_QUANTITIES)
        .reduce((units, quantities) => [...units, Object.keys(quantities).join('|')], [] as string[])
        .join('|');

    return [
        new RegExp(`((?:${quantityRangeRegex})|(?:${quantityRegex}))\\s*(?:(${unitsRegex})\\s+)?(.*)`, 'i'),
        new RegExp(quantityRangeSeparator, 'i'),
        Object.entries(INGREDIENT_UNIT_QUANTITIES).reduce((parsers, [unit, quantities]) => {
            Object.entries(quantities).forEach(([alias, quantity]) => {
                parsers[alias] = q => [
                    Array.isArray(q) ? [q[0] * quantity, q[1] * quantity] : q * quantity,
                    unit as IngredientUnit,
                ];
            });

            return parsers;
        }, {} as Record<string, IngredientQuantityParser>),
    ];
}

function parseIngredientQuantity(quantity?: string, unit?: string): [IngredientQuantity?, IngredientUnit?] {
    if (!quantity) return [];

    const parsedQuantity = quantity.match(QUANTITY_RANGE_SEPARATOR_REGEX)
        ? (quantity.split(QUANTITY_RANGE_SEPARATOR_REGEX).map(q => parseFloat(q.replace(',', '.'))) as [number, number])
        : parseFloat(quantity.replace(',', '.'));

    return QUANTITY_PARSERS[unit?.trim().toLowerCase() ?? '']?.(parsedQuantity) ?? [parsedQuantity];
}

export function parseIngredient(ingredient: string): IngredientBreakdown {
    const original = ingredient;
    const matches = ingredient.match(INGREDIENT_REGEX);
    const name = (matches?.[3] ?? ingredient).trim();
    const [quantity, unit] = parseIngredientQuantity(matches?.[1], matches?.[2]);

    return objectWithoutEmpty({ original, name, unit, quantity });
}

export function sortIngredients(ingredients: IngredientBreakdown[]): IngredientBreakdown[] {
    ingredients.sort((a, b) => compareIngredients(b, a));

    return ingredients;
}
