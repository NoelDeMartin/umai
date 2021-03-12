import { FieldType } from 'soukai';
import { SolidModel } from 'soukai-solid';

export default SolidModel.schema({
    name: {
        type: FieldType.String,
        required: true,
    },
});
