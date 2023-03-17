import { compare, objectWithoutEmpty } from '@noeldemartin/utils';

export type IngredientQuantity = number | [number, number];

export enum IngredientUnit {
    Grams = 'grams',
    Milliliters = 'milliliters',
}

export type IngredientBreakdown<Q extends IngredientQuantity = IngredientQuantity> = {
    template: string;
    original: string;
    quantity?: Q;
    unit?: IngredientUnit;
    unitMultiplier?: number;

    renderQuantity(quantity: Q): string;
};

type IngredientQuantityParser = (quantity: IngredientQuantity, originalUnit?: string) =>
    [IngredientQuantity, IngredientUnit, number, string];

const SPECIAL_QUANTITIES: Record<string, number> = {
    '½': .5,
    '¼': .25,
};
const SPECIAL_QUANTITIES_VALUES: Record<string, string> = Object
    .entries(SPECIAL_QUANTITIES)
    .reduce(
        (values, [name, value]) => {
            values[value.toString()] = name;

            return values;
        },
        {} as Record<string, string>,
    );

const INGREDIENT_UNIT_QUANTITIES: Record<IngredientUnit, Record<string, number>> = {
    // Some of these conversions depend on the ingredient. For example, a cup of flour
    // is 125g but a cup of water is 240g. But for now, this is fine because these conversions
    // are only used for sorting ingredients. If they are used to do actual conversions, this
    // should be kept in mind.
    [IngredientUnit.Grams]: {
        g: 1,
        grams: 1,
        kg: 1000,
        kilograms: 1000,
        cups: 200,
        lb: 453.5924,
        pounds: 453.5924,
        oz: 28.34952,
        ounces: 28.34952,
        tsp: 5,
        tbsp: 15,
        tbl: 15,
    },
    [IngredientUnit.Milliliters]: {
        ml: 1,
        milliliters: 1,
        l: 1000,
        liters: 1000,
        pt: 473,
        pint: 473,
    },
};

const RENDERED_UNITS: Record<string, string> = {
    cups: ' cups',
    grams: ' grams',
    kilograms: ' kilograms',
    liters: ' liters',
    milliliters: ' milliliters',
    ounces: ' ounces',
    pint: ' pint',
    pounds: ' pounds',
    tbl: ' tbl',
    tbsp: ' tbsp',
    tsp: ' tsp',
};

const QUANTITY_PLACEHOLDER = '{quantity}';
const [INGREDIENT_REGEX, QUANTITY_RANGE_SEPARATOR_REGEX, QUANTITY_PARSERS] = initializeHelpers();

function compareIngredients(a: IngredientBreakdown, b: IngredientBreakdown): number {
    const aIsOptional = a.original.toLowerCase().includes('optional');
    const bIsOptional = b.original.toLowerCase().includes('optional');

    if (aIsOptional && !bIsOptional) return -1;
    if (!aIsOptional && bIsOptional) return 1;
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
    const quantityRegex = `(?:(?:\\d+[.,\\d]*)|${Object.keys(SPECIAL_QUANTITIES).join('|')})`;
    const quantityRangeSeparator = 'to|-|~';
    const quantityRangeRegex = `${quantityRegex}\\s*(?:${quantityRangeSeparator})\\s*${quantityRegex}`;
    const unitsRegex = Object
        .values(INGREDIENT_UNIT_QUANTITIES)
        .reduce((units, quantities) => [...units, Object.keys(quantities).join('|')], [] as string[])
        .join('|');

    return [
        new RegExp(`.*?(((?:${quantityRangeRegex})|(?:${quantityRegex}))\\s*(?:(${unitsRegex})(?:\\s+|$))?).*?`, 'i'),
        new RegExp(quantityRangeSeparator, 'i'),
        Object
            .entries(INGREDIENT_UNIT_QUANTITIES)
            .reduce((parsers, [unit, quantities]) => {
                Object.entries(quantities).forEach(([alias, multiplier]) => {
                    parsers[alias] = (quantity, originalUnit) => [
                        Array.isArray(quantity)
                            ? [quantity[0] * multiplier, quantity[1] * multiplier]
                            : quantity * multiplier,
                        unit as IngredientUnit,
                        multiplier,
                        RENDERED_UNITS[originalUnit ?? ''] ?? originalUnit ?? '',
                    ];
                });

                return parsers;
            }, {} as Record<string, IngredientQuantityParser>),
    ];
}

function parseQuantityString(raw: string): number {
    return SPECIAL_QUANTITIES[raw] ?? parseFloat(raw.replace(',', '.'));
}

function renderQuantityString(quantity: number): string {
    const raw = quantity.toString();

    return SPECIAL_QUANTITIES_VALUES[raw] ?? raw;
}

function parseIngredientQuantity(quantity?: string, unit?: string): [
    (IngredientQuantity)?,
    IngredientUnit?,
    number?,
    string?,
] {
    if (!quantity)
        return [];

    const parsedQuantity = quantity.match(QUANTITY_RANGE_SEPARATOR_REGEX)
        ? quantity.split(QUANTITY_RANGE_SEPARATOR_REGEX).map(parseQuantityString) as [number, number]
        : parseQuantityString(quantity);

    return QUANTITY_PARSERS[unit?.trim().toLowerCase() ?? '']?.(parsedQuantity, unit) ?? [parsedQuantity];
}

export function parseIngredient(ingredient: string): IngredientBreakdown {
    const original = ingredient;
    const matches = ingredient.match(INGREDIENT_REGEX);
    const template = matches?.[1] ? ingredient.replace(matches[1].trim(), QUANTITY_PLACEHOLDER) : ingredient;
    const originalUnit = matches?.[3];
    const [quantity, unit, unitMultiplier, displayUnit] = parseIngredientQuantity(matches?.[2], originalUnit);

    return objectWithoutEmpty({
        template,
        original,
        quantity,
        unit,
        unitMultiplier,

        renderQuantity: typeof quantity !== 'undefined'
            ? Array.isArray(quantity)
                ? (quantity: [number, number]) => template.replace(
                    QUANTITY_PLACEHOLDER,
                    quantity.map(renderQuantityString).join(' - '),
                )
                : (quantity: number) => template.replace(
                    QUANTITY_PLACEHOLDER,
                    `${renderQuantityString(quantity)}${displayUnit ?? ''}`,
                )
            : () => original,
    });
}

export function sortIngredients(ingredients: IngredientBreakdown[]): IngredientBreakdown[] {
    ingredients.sort((a, b) => compareIngredients(b, a));

    return ingredients;
}
