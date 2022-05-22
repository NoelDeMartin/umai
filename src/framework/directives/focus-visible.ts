import type { Closure } from '@noeldemartin/utils';

import { defineDirective } from '@/framework/utils/vue';
import { hasAncestor } from '@/framework/utils/dom';

const listeners: WeakMap<HTMLElement, { focus: Closure; blur: Closure }> = new WeakMap();

export default defineDirective({
    mounted(element: HTMLElement, { value: setFocused }) {
        const elementListeners = {
            focus() {
                // TODO set up polyfill
                element.matches(':focus-visible') && setFocused(true);
            },
            blur() {
                setFocused(false);
            },
        };

        if ('Storybook' in window && hasAncestor(element, '.\\:focus-visible')) {
            setFocused(true);
        }

        listeners.set(element, elementListeners);
        element.addEventListener('focus', elementListeners.focus);
        element.addEventListener('blur', elementListeners.blur);
    },
    unmounted(element: HTMLElement) {
        const elementListeners = listeners.get(element);

        if (!elementListeners) {
            return;
        }

        element.removeEventListener('focus', elementListeners.focus);
        element.removeEventListener('blur', elementListeners.blur);
    },
});
