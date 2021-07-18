import { FieldType } from 'soukai';
import { SolidModel } from 'soukai-solid';

export default SolidModel.schema({
    name: {
        type: FieldType.String,
        required: true,
    },
    description: FieldType.String,
    ingredients: {
        type: FieldType.Array,
        rdfProperty: 'schema:recipeIngredient',
        items: FieldType.String,
    },
});
