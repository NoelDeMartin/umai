export default interface IBaseFluidInput {
    root?: HTMLInputElement;
    minWidth?: number;
    blur(): void;
    focus(): void;
    isFocused(): boolean;
}
