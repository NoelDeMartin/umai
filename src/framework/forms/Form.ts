import { reactive } from 'vue';

import FormInput from './FormInput';

export default class Form {

    public submitted: boolean = false;
    private inputs: Record<string, FormInput>;

    constructor(inputs: Record<string, string | FormInput>) {
        this.inputs = reactive(
            Object.entries(inputs).reduce((inputs, [name, input]) => {
                inputs[name] = typeof input === 'string'
                    ? new FormInput(input.split('|'))
                    : input;

                inputs[name].setForm(this);

                return inputs;
            }, {} as Record<string, FormInput>),
        ) as Record<string, FormInput>;
    }

    public input<T = unknown>(name: string): FormInput<T> | null {
        return this.inputs[name] as FormInput<T>;
    }

    public data(): Record<string, unknown>;
    public data<T=unknown>(name: string): T;
    public data(name?: string): Record<string, unknown> | unknown {
        if (name)
            return this.inputs[name].value;

        return Object.entries(this.inputs).reduce((data, [name, input]) => {
            data[name] = input.value;

            return data;
        }, {} as Record<string, unknown>);
    }

    public submit(): boolean {
        this.submitted = true;

        const invalidInput = Object
            .values(this.inputs)
            .map(input => input.validate())
            .find(valid => !valid);

        return invalidInput === undefined;
    }

}
