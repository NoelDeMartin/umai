import type { Component, Ref } from 'vue';

import { importModules } from '@/framework/utils/vite';
import { elementIsInViewport } from '@/framework/utils/dom';

export interface IFocusable {
    getRootElement(): HTMLElement | null;
    focus(options?: Partial<FocusOptions>): void;
    isFocused(): boolean;
    scrollIntoView(): void;
}

export interface FocusOptions {
    scrollIntoView: boolean;
}

export function focusable(element: Ref<IFocusable | null>): IFocusable {
    return {
        getRootElement: () => element.value?.getRootElement() ?? null,
        focus: options => element.value?.focus(options),
        isFocused: () => !!element.value?.isFocused(),
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
        scrollIntoView: () => getElement()?.scrollIntoView(),
    };
}

export default importModules<Component>(import.meta.globEager('@/framework/components/headless/*.vue'), '.vue');
