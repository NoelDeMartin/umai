import ElementTransitions from '@/framework/core/facades/ElementTransitions';
import { defineDirective } from '@/framework/utils/vue';

export default defineDirective({
    beforeMount(el, { value }) {
        ElementTransitions.beforeElementMounted(
            el,
            'transitions' in value ? value : { transitions: value },
        );
    },
    mounted(el) {
        ElementTransitions.elementMounted(el);
    },
    beforeUnmount(el) {
        ElementTransitions.beforeElementUnmounted(el);
    },
});
