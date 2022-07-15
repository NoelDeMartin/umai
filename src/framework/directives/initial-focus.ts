import { defineDirective } from '@/framework/utils/vue';

export default defineDirective({
    mounted(element: HTMLElement, { value }) {
        if (!value) {
            return;
        }

        element.focus();
    },
});
