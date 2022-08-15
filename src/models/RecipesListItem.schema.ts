import { FieldType } from 'soukai';
import { SolidModel } from 'soukai-solid';

export default SolidModel.schema({
    recipeUrl: {
        type: FieldType.Key,
        rdfProperty: 'schema:item',
        required: true,
    },
});
