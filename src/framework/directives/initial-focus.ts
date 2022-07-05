import { defineDirective } from '@/framework/utils/vue';

export default defineDirective({
    async mounted(element: HTMLElement) {
        element.focus();
    },
});
