import Form from './Form';

export const enum FormInputType {
    String = 'string',
    Boolean = 'boolean',
    Number = 'number',
}

export type GetFormInputValue<InputType> =
    InputType extends FormInputType.String ? string :
    InputType extends FormInputType.Boolean ? boolean :
    InputType extends FormInputType.Number ? number :
    never;

export type GetFormInputDefinitions<
    InputTypes extends Record<keyof InputMultis, FormInputType>,
    InputMultis extends Record<keyof InputTypes, boolean>,
> =
    { [key in keyof InputTypes]: FormInputDefinition<InputTypes[key], InputMultis[key]> } |
    { [key in keyof InputMultis]: FormInputDefinition<InputTypes[key], InputMultis[key]> };

export interface FormInputDefinition<Type extends FormInputType, Multi extends boolean> {
    type: Type;
    rules?: string;
    multi?: Multi;

    // TODO this doesn't seem to be working properly in all scenarios
    default?: Multi extends true ? GetFormInputValue<Type>[] : GetFormInputValue<Type>;
}

export type MagicForm<
    InputTypes extends Record<keyof InputMultis, FormInputType>,
    InputMultis extends Record<keyof InputTypes, boolean>,
> = {
    [key in keyof InputTypes]: InputMultis[key] extends true
        ? GetFormInputValue<InputTypes[key]>[]
        : GetFormInputValue<InputTypes[key]>
} & Form;

export function reactiveForm<
    InputTypes extends Record<keyof InputMultis, FormInputType>,
    InputMultis extends Record<keyof InputTypes, boolean>,
>(
    inputs: GetFormInputDefinitions<InputTypes, InputMultis>,
): MagicForm<InputTypes, InputMultis> {
    return new Form(inputs) as unknown as MagicForm<InputTypes, InputMultis>;
}
