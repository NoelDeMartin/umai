import { defineDirective } from '@/framework/utils/vue';

export default defineDirective({
    mounted(element: HTMLElement) {
        element.focus();
    },
});
