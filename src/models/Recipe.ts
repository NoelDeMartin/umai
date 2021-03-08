import { FieldType } from 'soukai';
import { SolidModel } from 'soukai-solid';
import type { ModelInterface } from 'soukai';

export default class Recipe extends SolidModel {

    static rdfContexts = { schema: 'https://schema.org' };
    static collection = 'local://recipes/';
    static rdfsClasses = ['Recipe'];
    static fields = {
        name: {
            type: FieldType.String,
            required: true,
        },
    };

}

export default interface Recipe extends ModelInterface<typeof Recipe> {}
