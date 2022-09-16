import { FieldType } from 'soukai';
import { SolidModel } from 'soukai-solid';

export default SolidModel.schema({
    name: {
        type: FieldType.String,
        required: true,
    },
    description: FieldType.String,
    imageUrls: {
        type: FieldType.Array,
        items: FieldType.String,
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
        rdfProperty: 'schema:recipeIngredient',
        items: FieldType.String,
    },
    instructionStepUrls: {
        type: FieldType.Array,
        rdfProperty: 'schema:recipeInstructions',
        items: FieldType.Key,
    },
    listUrls: {
        type: FieldType.Array,
        rdfProperty: 'purl:isReferencedBy',
        items: FieldType.Key,
    },
    externalUrls: {
        type: FieldType.Array,
        rdfProperty: 'schema:sameAs',
        items: FieldType.String,
    },
});
