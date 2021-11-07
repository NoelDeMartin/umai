import { FieldType } from 'soukai';
import { SolidModel } from 'soukai-solid';

export default SolidModel.schema({
    name: {
        type: FieldType.String,
        required: true,
    },
    description: FieldType.String,
    imageUrl: {
        type: FieldType.String,
        rdfProperty: 'schema:image',
    },
    ingredients: {
        type: FieldType.Array,
        rdfProperty: 'schema:recipeIngredient',
        items: FieldType.String,
    },
    instructionSteps: {
        type: FieldType.Array,
        rdfProperty: 'schema:recipeInstructions',
        items: FieldType.Key,
    },
});
