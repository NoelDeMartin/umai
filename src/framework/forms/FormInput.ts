import { arr } from '@noeldemartin/utils';

import rules from './rules';
import type Form from './Form';

export default class FormInput<Value = unknown> {

    public rules: string[];
    public errors: string[] = [];
    public value: Value | undefined = undefined;
    private form?: Form;

    constructor(rules: string[] = []) {
        this.rules = rules;
    }

    public get error(): string | null {
        return this.errors[0] ?? null;
    }

    public setForm(form: Form): void {
        this.form = form;
    }

    public update(value: Value | undefined): void {
        this.value = value;

        if (this.form && !this.form.submitted)
            return;

        this.validate();
    }

    public validate(): boolean {
        this.errors = arr(this.rules)
            .map(rule => rules[rule](this.value))
            .filter()
            .toArray();

        return this.errors.length === 0;
    }

}
