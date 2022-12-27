import { defineSolidModelSchema } from 'soukai-solid';
import { FieldType } from 'soukai';

export default defineSolidModelSchema({
    rdfContexts: { schema: 'https://schema.org/' },
    rdfsClass: 'schema:ListItem',
    history: false,
    timestamps: false,
    fields: {
        recipeUrl: {
            type: FieldType.Key,
            rdfProperty: 'schema:item',
            required: true,
        },
    },
});
