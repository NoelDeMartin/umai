import {
    arraySorted,
    compare,
    downloadFile,
    objectWithoutEmpty,
    stringMatch,
    stringToSlug,
    urlParse,
    urlResolve,
} from '@noeldemartin/utils';
import { SolidDocument } from 'soukai-solid';
import type { JsonLD, SolidDocumentPermission } from '@noeldemartin/solid-utils';
import type { Relation } from 'soukai';
import type { SolidBelongsToManyRelation } from 'soukai-solid';

import Cookbook from '@/services/facades/Cookbook';
import RecipeInstructionsStep from '@/models/RecipeInstructionsStep';
import RecipesList from '@/models/RecipesList';
import { parseIngredient, sortIngredients } from '@/utils/ingredients';
import type { IngredientBreakdown } from '@/utils/ingredients';

import Model from './Recipe.schema';

export interface RecipeServingsBreakdown {
    name: string;
    original: string;
    quantity?: number;
}

export default class Recipe extends Model {

    public static history = true;
    public static tombstone = false;
    public static rdfContexts = {
        schema: 'https://schema.org/',
        purl: 'http://purl.org/dc/terms/',
    };

    declare public instructions?: RecipeInstructionsStep[];
    declare public relatedInstructions: SolidBelongsToManyRelation<
        this,
        RecipeInstructionsStep,
        typeof RecipeInstructionsStep
    >;

    declare public lists?: RecipesList[];
    declare public relatedLists: SolidBelongsToManyRelation<
        this,
        RecipesList,
        typeof RecipesList
    >;

    public get imageUrl(): string | undefined {
        return this.imageUrls.length > 0 ? this.imageUrls[0] : undefined;
    }

    public get slug(): string | null {
        if (!this.url) {
            return null;
        }

        const getSlug = (offset: number) => {
            return this.url.substring(offset).replaceAll('/', '-').match(/([^#]+)(#.*)?$/)?.[1] ?? null;
        };

        if (Cookbook.remoteCookbookUrl && this.url.startsWith(Cookbook.remoteCookbookUrl)) {
            return getSlug(Cookbook.remoteCookbookUrl.length);
        }

        if (this.url.startsWith(Cookbook.localCookbookUrl)) {
            return getSlug(Cookbook.localCookbookUrl.length);
        }

        return null;
    }

    public get sortedExternalUrls(): string[] {
        const externalUrls = this.externalUrls.map(url => ({
            url,
            domain: urlParse(url)?.domain?.replace(/^www\./, ''),
        }));

        return arraySorted(externalUrls, (a, b) => compare(a.domain, b.domain)).map(({ url }) => url);
    }

    public get sortedIngredients(): string[] {
        return this.sortedIngredientsBreakdown.map(({ original }) => original);
    }

    public get sortedIngredientsBreakdown(): IngredientBreakdown[] {
        const ingredients = this.ingredients.map(parseIngredient);

        sortIngredients(ingredients);

        return ingredients;
    }

    public get servingsBreakdown(): RecipeServingsBreakdown | null {
        if (!this.servings) {
            return null;
        }

        const quantity = stringMatch<3>(this.servings, /^(\d+)\s*(.*)/);

        return objectWithoutEmpty({
            original: this.servings,
            name: quantity ? quantity[2] : this.servings,
            quantity: quantity ? parseInt(quantity[1]) : null,
        });
    }

    public get sortedInstructions(): RecipeInstructionsStep[] {
        return arraySorted(this.instructions ?? [], 'position');
    }

    public is(other: Recipe): boolean {
        return this.url === other.url
            || this.externalUrls.some(url => url === other.url);
    }

    public instructionsRelationship(): Relation {
        return this
            .belongsToMany(RecipeInstructionsStep, 'instructionStepUrls')
            .onDelete('cascade')
            .usingSameDocument(true);
    }

    public listsRelationship(): Relation {
        return this.belongsToMany(RecipesList, 'listUrls');
    }

    public toExternalJsonLD(includeIds?: boolean): JsonLD {
        return this.toJsonLD({
            ids: includeIds ?? this.url?.startsWith('http'),
            timestamps: false,
            history: false,
        });
    }

    public download(): void {
        const name = this.slug ?? 'recipe';
        const jsonld = this.toExternalJsonLD();

        downloadFile(`${name}.json`, JSON.stringify(jsonld), 'application/json');
    }

    public async updatePublicPermissions(permissions: SolidDocumentPermission[]): Promise<void> {
        await super.updatePublicPermissions(permissions);

        if (!this.imageUrl?.startsWith(this.requireContainerUrl())) {
            return;
        }

        await new SolidDocument({ url: this.imageUrl }).updatePublicPermissions(permissions);
    }

    protected newUrl(documentUrl?: string, resourceHash?: string): string {
        documentUrl = documentUrl ?? urlResolve(this.static('collection'), stringToSlug(this.name));
        resourceHash = resourceHash ?? this.static('defaultResourceHash');

        return `${documentUrl}#${resourceHash}`;
    }

}
