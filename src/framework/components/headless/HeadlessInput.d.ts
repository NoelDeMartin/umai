export interface HeadlessInputController {
    id: string;
    type: string;
    value: string | number | null;
    name?: string;
    placeholder?: string;
    error?: string | null;
    inputElement?: HTMLInputElement;

    update(): void;
}

export default interface IHeadlessInput {
    focus(): void;
}
