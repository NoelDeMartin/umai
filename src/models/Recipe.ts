import { arraySorted, compare, downloadFile, stringToSlug, urlParse, urlResolve } from '@noeldemartin/utils';
import type { Relation } from 'soukai';
import type { SolidBelongsToManyRelation } from 'soukai-solid';

import RecipeInstructionsStep from '@/models/RecipeInstructionsStep';
import { parseIngredient, sortIngredients } from '@/utils/ingredients';

import Model from './Recipe.schema';

export default class Recipe extends Model {

    public static history = true;
    public static rdfContexts = { schema: 'https://schema.org/' };

    declare public instructions?: RecipeInstructionsStep[];
    declare public relatedInstructions: SolidBelongsToManyRelation<
        this,
        RecipeInstructionsStep,
        typeof RecipeInstructionsStep
    >;

    public get uuid(): string | null {
        return this.url
            ? (this.url.match(/([^/#]+)(#.*)?$/)?.[1] ?? null)
            : null;
    }

    public get sortedExternalUrls(): string[] {
        const externalUrls = this.externalUrls.map(url => ({
            url,
            domain: urlParse(url)?.domain?.replace(/^www\./, ''),
        }));

        return arraySorted(externalUrls, (a, b) => compare(a.domain, b.domain)).map(({ url }) => url);
    }

    public get sortedIngredients(): string[] {
        const ingredients = this.ingredients.map(parseIngredient);

        sortIngredients(ingredients);

        return ingredients.map(({ original }) => original);
    }

    public is(other: Recipe): boolean {
        return this.url === other.url
            || this.externalUrls.some(url => url === other.url);
    }

    public instructionsRelationship(): Relation {
        return this
            .belongsToMany(RecipeInstructionsStep, 'instructionSteps')
            .onDelete('cascade')
            .usingSameDocument(true);
    }

    public download(): void {
        const name = this.uuid ?? 'recipe';
        const jsonld = this.toJsonLD({
            ids: this.url?.startsWith('http'),
            timestamps: false,
            history: false,
        });

        downloadFile(`${name}.json`, JSON.stringify(jsonld), 'application/json');
    }

    protected newUrl(documentUrl?: string, resourceHash?: string): string {
        documentUrl = documentUrl ?? urlResolve(this.static('collection'), stringToSlug(this.name));
        resourceHash = resourceHash ?? this.static('defaultResourceHash');

        return `${documentUrl}#${resourceHash}`;
    }

}
