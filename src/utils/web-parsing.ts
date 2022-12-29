import { arr, arrayFilter, isObject, objectWithoutEmpty, silenced, stringMatchAll, tap } from '@noeldemartin/utils';
import { isJsonLDGraph } from '@noeldemartin/solid-utils';
import type { JsonLD, JsonLDResource } from '@noeldemartin/solid-utils';

import { translate } from '@/framework/utils/translate';

import Recipe from '@/models/Recipe';

const CONTEXT_ALIASES: Record<string, string> = {
    'http://schema.org': 'https://schema.org/',
    'http://schema.org/': 'https://schema.org/',
    'https://schema.org': 'https://schema.org/',
};

interface RecipeJsonLD extends JsonLD {
    cookTime?: string;
    prepTime?: string;
    totalTime?: string;
    recipeInstructions?: string | string[] | JsonLD | JsonLD[];
    recipeIngredient?: string | string[];
    image?: string | string[] | { url?: string } | { url?: string }[];
    reviews?: unknown;
}

function reshapeRecipeJsonLD(json: RecipeJsonLD): void {
    reshapeContexts(json);
    reshapeRecipeMetadata(json);
    reshapeRecipeInstructions(json);
    reshapeRecipeIngredients(json);
    reshapeRecipeImage(json);
}

// TODO move to soukai
function reshapeContexts(json: JsonLD): void {
    for (const [property, value] of Object.entries(json)) {
        if (property === '@context' && typeof value === 'string') {
            json['@context'] = { '@vocab': CONTEXT_ALIASES[value] ?? value };

            continue;
        }

        if (isObject(value)) {
            reshapeContexts(value);
        }
    }
}

function reshapeRecipeMetadata(json: RecipeJsonLD): void {
    if (json.cookTime || json.prepTime || !json.totalTime) {
        return;
    }

    json.cookTime = json.totalTime;
}

function reshapeRecipeIngredients(json: RecipeJsonLD): void {
    if (!json.recipeIngredient)
        return;

    json.recipeIngredient = [json.recipeIngredient].flat().map(ingredient => ingredient.trim());
}

function reshapeRecipeInstructions(json: RecipeJsonLD): void {
    if (typeof json.recipeInstructions === 'string') {
        json.recipeInstructions = parseInstructions(json.recipeInstructions);

        return;
    }

    if (Array.isArray(json.recipeInstructions)) {
        json.recipeInstructions = json.recipeInstructions.map(
            (instruction, index) => typeof instruction === 'object'
                ? {
                    position: index + 1,
                    ...instruction,
                }
                : {
                    '@context': { '@vocab': 'https://schema.org/' },
                    '@type': 'HowToStep',
                    'text': instruction,
                    'position': index + 1,
                },
        );

        return;
    }
}

function reshapeRecipeImage(json: RecipeJsonLD) {
    if (typeof json.image === 'string' && json.image.startsWith('http:http')) {
        json.image = json.image.slice(5);

        return;
    }

    if (Array.isArray(json.image)) {
        json.image = json.image[0];

        reshapeRecipeImage(json);

        return;
    }

    if (typeof json.image === 'object') {
        json.image = json.image.url;

        return;
    }
}

function parseInstructions(instructions: string): JsonLD | JsonLD[] {
    const matches = instructions.matchAll(/<li[^>]*?>([\S\s]*?)<\/li>/gim);
    const steps = arr(matches).map(([, step]) => step);

    return steps.length > 0
        ? steps
            .map((step, index) => ({
                '@context': { '@vocab': 'https://schema.org/' },
                '@type': 'HowToStep',
                'text': step,
                'position': index + 1,
            }))
            .toArray()
        : {
            '@context': { '@vocab': 'https://schema.org/' },
            '@type': 'HowToStep',
            'text': instructions,
            'position': 1,
        };
}

function extractJsonLDResources(html: string): JsonLDResource[] {
    const jsonLD = stringMatchAll<2>(html, /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gim);

    return arr(jsonLD)
        .map(([, rawJson]) => JSON.parse(rawJson))
        .flat()
        .map(jsonGraph => {
            if (isJsonLDGraph(jsonGraph)) {
                return jsonGraph['@graph'].map(recipeJson => tap(recipeJson, () => {
                    recipeJson['@context'] = jsonGraph['@context'];
                }));
            }

            return [jsonGraph];
        })
        .flat()
        .filter(resource => !!resource) as unknown as JsonLDResource[];
}

export interface WebsiteMetadata {
    url: string;
    title: string;
    imageUrls?: string[];
    description?: string;
}

export async function parseWebsiteRecipes(url: string, html: string): Promise<Recipe[]> {
    const recipes = await Promise.all(extractJsonLDResources(html) .map(jsonld => {
        reshapeRecipeJsonLD(jsonld);

        return silenced(Recipe.newFromJsonLD(jsonld));
    }));

    return arrayFilter(recipes)
        .map(recipe => tap(recipe, () => recipe.setAttribute('externalUrls', [url])));
}

export function parseWebsiteMetadata(url: string, html: string): WebsiteMetadata {
    const head = html.match(/<head[^>]*>([\s\S]*?)<\/head>/im)?.[1] ?? '';
    const titleMatch =
        head.match(/<meta[^>]+name="title"[^>]+content="([^"]+)"[^>]*\/?>/im) ??
        head.match(/<meta[^>]+content="([^"]+)"[^>]+name="title"[^>]*\/?>/im) ??
        head.match(/<title[^>]*>([\s\S]*?)<\/title>/im);
    const descriptionMatch =
        head.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"[^>]*\/?>/im) ??
        head.match(/<meta[^>]+content="([^"]+)"[^>]+name="description"[^>]*\/?>/im);
    const imageUrlMatch =
        head.match(/<meta[^>]+name="(?:og:image|twitter:image)"[^>]+content="([^"]+)"[^>]*\/?>/im) ??
        head.match(/<meta[^>]+content="([^"]+)"[^>]+name="(?:og:image|twitter:image)"[^>]*\/?>/im);

    return objectWithoutEmpty({
        url,
        title: titleMatch?.[1] ?? translate('webImport.defaultWebsiteTitle'),
        description: descriptionMatch?.[1] ?? null,
        imageUrls: arrayFilter([imageUrlMatch?.[1]]),
    });
}
