import { defineSolidModelSchema } from 'soukai-solid';
import { FieldType } from 'soukai';

export default defineSolidModelSchema({
    rdfContexts: {
        schema: 'https://schema.org/',
        purl: 'http://purl.org/dc/terms/',
    },
    rdfsClass: 'schema:Recipe',
    history: true,
    tombstone: false,
    fields: {
        name: {
            type: FieldType.String,
            required: true,
        },
        description: FieldType.String,
        imageUrls: {
            type: FieldType.Array,
            items: FieldType.Key,
            rdfProperty: 'schema:image',
        },
        servings: {
            type: FieldType.String,
            rdfProperty: 'schema:recipeYield',
        },
        prepTime: FieldType.String,
        cookTime: FieldType.String,
        ingredients: {
            type: FieldType.Array,
            items: FieldType.String,
            rdfProperty: 'schema:recipeIngredient',
        },
        instructionStepUrls: {
            type: FieldType.Array,
            items: FieldType.Key,
            rdfProperty: 'schema:recipeInstructions',
        },
        listUrls: {
            type: FieldType.Array,
            items: FieldType.Key,
            rdfProperty: 'purl:isReferencedBy',
        },
        externalUrls: {
            type: FieldType.Array,
            items: FieldType.Key,
            rdfProperty: 'schema:sameAs',
        },
    },
});
