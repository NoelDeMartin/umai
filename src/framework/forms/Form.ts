import { MagicObject } from '@noeldemartin/utils';
import { reactive } from 'vue';

import { FormInputType } from './';
import type { FormInputDefinition, GetFormInputValue } from './';

import FormInput from './FormInput';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InferAny = any;

export default class Form extends MagicObject {

    protected static defaultInputValues?: { [K in FormInputType]: GetFormInputValue<K> };

    protected static getDefaultValue(input: FormInputDefinition<InferAny, InferAny>): unknown {
        this.defaultInputValues = this.defaultInputValues ?? {
            [FormInputType.String]: '',
            [FormInputType.Boolean]: false,
            [FormInputType.Number]: 0,
        };

        return input.multi ? [] : this.defaultInputValues?.[input.type as FormInputType];
    }

    public submitted: boolean = false;
    private inputs: Record<string, FormInput>;

    constructor(inputs: Record<string, FormInputDefinition<InferAny, InferAny>>) {
        super();

        this.inputs = reactive(
            Object.entries(inputs).reduce((inputs, [name, input]) => {
                const formInput = inputs[name] = new FormInput(
                    input.default ?? Form.getDefaultValue(input.type),
                    input.rules?.split('|'),
                );

                formInput.setForm(this);

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
        return name
            ? this.inputs[name]?.value
            : Object.entries(this.inputs).reduce((data, [name, input]) => {
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

    protected __get(property: string): unknown {
        return this.inputs[property]?.value;
    }

    protected __set(property: string, value: unknown): void {
        this.inputs[property]?.update(value);
    }

}
