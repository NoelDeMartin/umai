import { FieldType } from 'soukai';
import { SolidModel } from 'soukai-solid';

export default SolidModel.schema({
    text: {
        type: FieldType.String,
        required: true,
    },
    position: {
        type: FieldType.Number,
        required: true,
    },
});
