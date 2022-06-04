import type { IFocusable } from '@/framework/components/headless';

export default interface IHeadlessInput<T = unknown | null> extends IFocusable {
    value: T;
}

export interface HeadlessInputController {
    id: string;
    type: string;
    value: unknown | null;
    name?: string;
    placeholder?: string;
    error?: string | null;
    inputElement?: HTMLInputElement | HTMLTextAreaElement;

    update(): void;
}
