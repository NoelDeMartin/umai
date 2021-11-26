import ElementTransitions from '@/framework/core/facades/ElementTransitions';
import { defineDirective } from '@/framework/utils/vue';

export default defineDirective({
    beforeMount(el, { value }) {
        const config = 'transitions' in value ? value : { transitions: value };

        if (typeof config.transitions.leave === 'function')
            config.transitions.leave = { '*': config.transitions.leave };

        if (typeof config.transitions.enter === 'function')
            config.transitions.enter = { '*': config.transitions.enter };

        ElementTransitions.beforeElementMounted(el, config);
    },
    mounted(el) {
        ElementTransitions.elementMounted(el);
    },
    beforeUnmount(el) {
        ElementTransitions.beforeElementUnmounted(el);
    },
});
