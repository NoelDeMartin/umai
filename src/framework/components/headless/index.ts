import type { Component, Ref } from 'vue';

import { importModules } from '@/framework/utils/vite';
import { elementIsInViewport } from '@/framework/utils/dom';

export interface IElement {
    getRootElement(): HTMLElement | null;
}

export interface IFocusable extends IElement {
    focus(options?: Partial<FocusOptions>): void;
    isFocused(): boolean;
    blur(): void;
    scrollIntoView(): void;
}

export interface FocusOptions {
    scrollIntoView: boolean;
}

export interface A11y {
    hidden: Ref<boolean>;
}

export function element(element: Ref<HTMLElement | null>): IElement {
    return {
        getRootElement: () => element.value,
    };
}

export function focusable(element: Ref<IFocusable | null>): IFocusable {
    return {
        getRootElement: () => element.value?.getRootElement() ?? null,
        focus: options => element.value?.focus(options),
        isFocused: () => !!element.value?.isFocused(),
        blur: () => element.value?.blur(),
        scrollIntoView: () => element.value?.scrollIntoView(),
    };
}

export function focusableElement(element: Ref<HTMLElement | null> | (() => HTMLElement | null)): IFocusable {
    const getElement = typeof element === 'function' ? element : () => element.value;

    return {
        getRootElement: () => getElement() ?? null,
        focus(options: Partial<FocusOptions> = {}) {
            const element = getElement();
            const scrollIntoView = options.scrollIntoView ?? true;

            if (!element)
                return;

            if (scrollIntoView && !elementIsInViewport(element))
                this.scrollIntoView();

            element.focus();
        },
        isFocused: () => !!getElement()?.matches(':focus'),
        blur() {
            const element = getElement();

            if (!element)
                return;

            element.blur();
        },
        scrollIntoView: () => getElement()?.scrollIntoView(),
    };
}

export default importModules<Component>(
    import.meta.glob('@/framework/components/headless/*.vue', { eager: true }),
    '.vue',
);
