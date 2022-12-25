import { defineDirective } from '@/framework/utils/vue';
import { safeHtml } from '@/framework/utils/sanitization';

function render(element: HTMLElement, html: string): void {
    element.innerHTML = safeHtml(html);
}

export default defineDirective({
    mounted(element: HTMLElement, { value }) {
        render(element, value);
    },
    updated(element: HTMLElement, { value }) {
        render(element, value);
    },
});
