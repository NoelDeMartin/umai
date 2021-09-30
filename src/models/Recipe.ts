import { stringToSlug, urlResolve } from '@noeldemartin/utils';
import RecipeInstructionsStep from '@/models/RecipeInstructionsStep';
import type { Relation } from 'soukai';
import type { SolidBelongsToManyRelation } from 'soukai-solid';

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

    public instructionsRelationship(): Relation {
        return this
            .belongsToMany(RecipeInstructionsStep, 'instructionSteps')
            .onDelete('cascade')
            .usingSameDocument(true);
    }

    protected newUrl(documentUrl?: string, resourceHash?: string): string {
        documentUrl = documentUrl ?? urlResolve(this.static('collection'), stringToSlug(this.name));
        resourceHash = resourceHash ?? this.static('defaultResourceHash');

        return `${documentUrl}#${resourceHash}`;
    }

}
