import { defineDirective } from '@/framework/utils/vue';

export default defineDirective({
    mounted(element: HTMLElement, { value }) {
        if (value === false) {
            return;
        }

        element.focus();
    },
});
