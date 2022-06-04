import { uuid } from '@noeldemartin/utils';
import type { Constructor } from '@noeldemartin/utils';

import FormValue from '@/framework/forms/FormValue';

export default class CoreListItemValue extends FormValue<string> {

    public readonly id: string;

    constructor(value: string = '', id?: string) {
        super(value);

        this.id = id ?? uuid();
    }

    public update(value: string): this {
        const Constructor = this.constructor as unknown as Constructor<this>;

        return new Constructor(value, this.id);
    }

}
