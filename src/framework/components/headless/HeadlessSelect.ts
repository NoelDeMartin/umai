export function defineSelectOption<T = number | string>(option: SelectOption<T>): SelectOption<T> {
    return option;
}

export interface SelectOption<T = number | string> {
    text: string;
    value: T;
}
