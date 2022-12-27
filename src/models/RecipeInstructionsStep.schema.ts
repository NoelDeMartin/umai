import { defineSolidModelSchema } from 'soukai-solid';
import { FieldType } from 'soukai';

export default defineSolidModelSchema({
    rdfContexts: { schema: 'https://schema.org/' },
    rdfsClass: 'schema:HowToStep',
    history: true,
    fields: {
        text: {
            type: FieldType.String,
            required: true,
        },
        position: {
            type: FieldType.Number,
            required: true,
        },
    },
});
