import DOMPurify from 'dompurify';

import { defineDirective } from '@/framework/utils/vue';

function render(element: HTMLElement, html: string): void {
    // TODO improve target="_blank" exception
    // See https://github.com/cure53/DOMPurify/issues/317
    element.innerHTML = DOMPurify.sanitize(html, { ADD_ATTR: ['target'] });
}

export default defineDirective({
    mounted(element: HTMLElement, { value }) {
        render(element, value);
    },
    updated(element: HTMLElement, { value }) {
        render(element, value);
    },
});
