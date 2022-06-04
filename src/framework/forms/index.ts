import Form from './Form';

export const enum FormInputType {
    String = 'string',
    Boolean = 'boolean',
    Number = 'number',
    Object = 'object',
}

export type FormObjectInput<Type> = FormInputType.Object & { __objectType: Type };

export type GetFormInputValue<InputType> =
    InputType extends FormObjectInput<infer T> ? T :
    InputType extends FormInputType.String ? string :
    InputType extends FormInputType.Boolean ? boolean :
    InputType extends FormInputType.Number ? number :
    InputType extends FormInputType.Object ? object :
    never;

export interface FormInputDefinition<
    Type extends FormInputType = FormInputType,
    Multi extends boolean = boolean
> {
    type: Type;
    rules?: string;
    multi?: Multi;

    // TODO require default for object types
    default?: Multi extends true ? GetFormInputValue<Type>[] : GetFormInputValue<Type>;
}

export type MagicForm<Inputs extends Record<string, FormInputDefinition>> = {
    [key in keyof Inputs]: Inputs[key]['multi'] extends true
        ? GetFormInputValue<Inputs[key]['type']>[]
        : GetFormInputValue<Inputs[key]['type']>
} & Form;

export function reactiveForm<Inputs extends Record<string, FormInputDefinition>>(inputs: Inputs): MagicForm<Inputs> {
    return new Form(inputs) as MagicForm<Inputs>;
}
