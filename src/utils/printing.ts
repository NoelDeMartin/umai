import * as pdfMake from 'pdfmake/build/pdfmake';
import { arrayFilter, arraySorted, range, tap } from '@noeldemartin/utils';
import type {
    Content,
    ContentImage,
    ContentTable,
    ContentText,
    TDocumentDefinitions,
    TFontDictionary,
} from 'pdfmake/interfaces';

import TailwindCSS from '@/framework/utils/tailwindcss';
import { translate } from '@/framework/utils/translate';

import livvicNormalUrl from '@/assets/fonts/Livvic-Regular.ttf';
import livvicBoldUrl from '@/assets/fonts/Livvic-Bold.ttf';
import livvicItalicsUrl from '@/assets/fonts/Livvic-Italic.ttf';
import livvicBoldItalicsUrl from '@/assets/fonts/Livvic-BoldItalic.ttf';
import type Recipe from '@/models/Recipe';

// TODO why is it complaining about "Illegal reassignment to import 'pdfMake'" during build?

function getFontDefinitions(): TFontDictionary {
    return {
        Livvic: {
            // TODO don't hardcode root url
            normal: `http://localhost:5173${livvicNormalUrl}`,
            bold: `http://localhost:5173${livvicBoldUrl}`,
            italics: `http://localhost:5173${livvicItalicsUrl}`,
            bolditalics: `http://localhost:5173${livvicBoldItalicsUrl}`,
        },
    };
}

async function renderRecipeDocument(recipe: Recipe, image?: HTMLImageElement): Promise<TDocumentDefinitions> {
    return {
        content: arrayFilter([
            { text: recipe.name, style: 'title' },
            recipe.imageUrl && image && await renderImage(image),
            recipe.description && renderMarkdown(recipe.description),
            renderRecipeMetadata(recipe),
            ...renderRecipeIngredients(recipe),
            ...renderRecipeInstructions(recipe),
            // TODO external urls
        ]),
        defaultStyle: {
            font: 'Livvic',
        },
        styles: {
            title: {
                fontSize: 23,
                bold: true,
                color: TailwindCSS.css('colors.primary.500'),
                marginBottom: 10,
            },
            h1: {
                fontSize: 18,
                bold: true,
                marginTop: 10,
                marginBottom: 5,
            },
            // TODO link styles
        },
    };
}

async function renderImage(image: HTMLImageElement): Promise<ContentImage | null> {
    const canvas = tap(document.createElement('canvas'), canvas => {
        canvas.width = 515;
        canvas.height = 200;
    });
    const context = canvas.getContext('2d') ?? fail('Could not get canvas context');

    try {
        // TODO center cover
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        return { image: canvas.toDataURL() };
    } catch (error) {
        return null;
    }
}

function renderMarkdown(text: string): ContentText {
    // TODO

    return { text, marginBottom: 10 };
}

function renderRecipeMetadata(recipe: Recipe): ContentTable| null {
    if (!recipe.servings && !recipe.prepTime && !recipe.cookTime) {
        return null;
    }

    const renderHeader = (icon: string, name: string) => ({
        margin: 5,
        columns: [
            {
                svg: icon,
                width: 15,
            },
            {
                width: 'auto',
                text: name,
            },
        ],
    });

    return {
        layout: 'noBorders',
        fillColor: TailwindCSS.css('colors.gray.200'),
        marginBottom: 10,
        table: {
            widths: ['*','*','*'],
            body: [
                // TODO use proper svgs
                [
                    renderHeader(
                        // eslint-disable-next-line max-len
                        '<svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 20 20" width="15" height="15"><g fill="currentColor"><path fill-rule="evenodd" d="M11.27 5.506c0 1.942 1.063 3.308 3 3.994V11a1 1 0 1 0 2 0V1.5a1 1 0 0 0-1.442-.897c-2.316 1.141-3.558 2.8-3.558 4.903Zm2 0c0-.82.319-1.535 1-2.161v3.971c-.695-.411-1-.999-1-1.81Z" clip-rule="evenodd"></path><path d="M13.27 17.5v-5a2 2 0 1 1 4 0v5a2 2 0 0 1-4 0ZM3.283 2.45a1 1 0 1 1 1.998.1c-.08 1.603.002 2.682.2 3.158c.095.23.253.315.712.288a1 1 0 1 1 .114 1.997c-1.258.073-2.229-.446-2.674-1.519c-.343-.828-.444-2.142-.35-4.024Z"></path><path d="M10.717 2.45a1 1 0 1 0-1.998.1c.08 1.603-.002 2.682-.2 3.158c-.096.23-.253.315-.712.288a1 1 0 1 0-.115 1.997c1.258.073 2.23-.446 2.675-1.519c.343-.828.444-2.142.35-4.024Z"></path><path d="M6 2.5a1 1 0 0 1 2 0v9a1 1 0 1 1-2 0v-9Z"></path><path d="M5 17.5v-5a2 2 0 1 1 4 0v5a2 2 0 1 1-4 0Z"></path></g></svg>',
                        translate('recipes.prepTime'),
                    ),
                    renderHeader(
                        // eslint-disable-next-line max-len
                        '<svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 20 20" width="15" height="15"><g fill="currentColor"><path fill-rule="evenodd" d="M11.27 5.506c0 1.942 1.063 3.308 3 3.994V11a1 1 0 1 0 2 0V1.5a1 1 0 0 0-1.442-.897c-2.316 1.141-3.558 2.8-3.558 4.903Zm2 0c0-.82.319-1.535 1-2.161v3.971c-.695-.411-1-.999-1-1.81Z" clip-rule="evenodd"></path><path d="M13.27 17.5v-5a2 2 0 1 1 4 0v5a2 2 0 0 1-4 0ZM3.283 2.45a1 1 0 1 1 1.998.1c-.08 1.603.002 2.682.2 3.158c.095.23.253.315.712.288a1 1 0 1 1 .114 1.997c-1.258.073-2.229-.446-2.674-1.519c-.343-.828-.444-2.142-.35-4.024Z"></path><path d="M10.717 2.45a1 1 0 1 0-1.998.1c.08 1.603-.002 2.682-.2 3.158c-.096.23-.253.315-.712.288a1 1 0 1 0-.115 1.997c1.258.073 2.23-.446 2.675-1.519c.343-.828.444-2.142.35-4.024Z"></path><path d="M6 2.5a1 1 0 0 1 2 0v9a1 1 0 1 1-2 0v-9Z"></path><path d="M5 17.5v-5a2 2 0 1 1 4 0v5a2 2 0 1 1-4 0Z"></path></g></svg>',
                        translate('recipes.cookTime'),
                    ),
                    renderHeader(
                        // eslint-disable-next-line max-len
                        '<svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 20 20" width="15" height="15"><g fill="currentColor"><path fill-rule="evenodd" d="M11.27 5.506c0 1.942 1.063 3.308 3 3.994V11a1 1 0 1 0 2 0V1.5a1 1 0 0 0-1.442-.897c-2.316 1.141-3.558 2.8-3.558 4.903Zm2 0c0-.82.319-1.535 1-2.161v3.971c-.695-.411-1-.999-1-1.81Z" clip-rule="evenodd"></path><path d="M13.27 17.5v-5a2 2 0 1 1 4 0v5a2 2 0 0 1-4 0ZM3.283 2.45a1 1 0 1 1 1.998.1c-.08 1.603.002 2.682.2 3.158c.095.23.253.315.712.288a1 1 0 1 1 .114 1.997c-1.258.073-2.229-.446-2.674-1.519c-.343-.828-.444-2.142-.35-4.024Z"></path><path d="M10.717 2.45a1 1 0 1 0-1.998.1c.08 1.603-.002 2.682-.2 3.158c-.096.23-.253.315-.712.288a1 1 0 1 0-.115 1.997c1.258.073 2.23-.446 2.675-1.519c.343-.828.444-2.142.35-4.024Z"></path><path d="M6 2.5a1 1 0 0 1 2 0v9a1 1 0 1 1-2 0v-9Z"></path><path d="M5 17.5v-5a2 2 0 1 1 4 0v5a2 2 0 1 1-4 0Z"></path></g></svg>',
                        translate('recipes.servings'),
                    ),
                ],
                [
                    { text: recipe.prepTime ?? '-', margin: 5 },
                    { text: recipe.cookTime ?? '-', margin: 5 },
                    { text: recipe.servings ?? '-', margin: 5 },
                ],
            ],
        },
    };
}

function renderRecipeIngredients(recipe: Recipe): Content[] {
    if (recipe.ingredients.length === 0) {
        return [];
    }

    const sortedIngredients = recipe.sortedIngredients;

    return [
        { text: translate('recipes.ingredients'), style: 'h1' },
        {
            columns: range(sortedIngredients.length)
                .reduce(
                    (columns, index) => {
                        columns[index % columns.length]?.push({
                            text: sortedIngredients[index] ?? '',
                            marginTop: 5,
                        });

                        return columns;
                    },
                    [[], []] as ContentText[][],
                )
                .map(ingredients => ({ ul: ingredients })),
        },
    ];
}

function renderRecipeInstructions(recipe: Recipe): Content[] {
    if (recipe.instructionStepUrls.length === 0) {
        return [];
    }

    return [
        { text: translate('recipes.instructions'), style: 'h1' },
        {
            markerColor: TailwindCSS.css('colors.primary.500'),
            ol: arraySorted(recipe.instructions ?? [], ({ position: a }, { position: b }) => a - b)
                .map(({ text }) => ({ text, marginTop: 5 })),
        },
    ];
}

export async function printRecipe(recipe: Recipe, image?: HTMLImageElement): Promise<void> {
    const pdf = pdfMake.createPdf(
        // TODO set doc metadata? https://pdfmake.github.io/docs/0.1/document-definition-object/document-medatadata/
        await renderRecipeDocument(recipe, image),
        undefined,
        getFontDefinitions(),
    );

    pdf.download();
}
