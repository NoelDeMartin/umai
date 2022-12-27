import { defineSolidModelSchema } from 'soukai-solid';
import { FieldType } from 'soukai';

export default defineSolidModelSchema({
    rdfContexts: {
        schema: 'https://schema.org/',
        purl: 'http://purl.org/dc/terms/',
    },
    rdfsClass: 'schema:ItemList',
    history: false,
    timestamps: false,
    fields: {
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
    },
});
