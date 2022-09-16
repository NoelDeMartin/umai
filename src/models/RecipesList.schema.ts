import { FieldType } from 'soukai';
import { SolidModel } from 'soukai-solid';

export default SolidModel.schema({
    name: {
        type: FieldType.String,
        required: true,
    },
    description: FieldType.String,
    creatorWebId: {
        type: FieldType.Key,
        rdfProperty: 'purl:creator',
    },
    itemUrls: {
        type: FieldType.Array,
        rdfProperty: 'schema:itemListElement',
        items: FieldType.Key,
    },
});
