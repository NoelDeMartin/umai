import type { Falsy } from '@noeldemartin/utils';

import ElementTransitions from '@/framework/core/facades/ElementTransitions';
import { defineDirective } from '@/framework/utils/vue';
import type {
    EnterTransition,
    LeaveTransition,
    TransitionalElementConfig,
} from '@/framework/core/services/ElementTransitionsService';

type DirectiveConfig = DirectiveTransitionalElementConfig | DirectiveTransitionalElementConfig['transitions'];

type DirectiveTransitionalElementConfig = TransitionalElementConfig | {
    transitions: {
        enter?: EnterTransition;
        leave?: LeaveTransition;
    };
};

function isFullConfig(directiveConfig: DirectiveConfig): directiveConfig is DirectiveTransitionalElementConfig {
    return 'transitions' in directiveConfig;
}

function getConfig(directiveConfig: DirectiveConfig | Falsy): TransitionalElementConfig | Falsy {
    if (!directiveConfig) {
        return;
    }

    const config = isFullConfig(directiveConfig) ? directiveConfig : { transitions: directiveConfig };

    return {
        ...config,
        transitions: {
            ...config.transitions,
            enter: typeof config.transitions.enter === 'function'
                ? { '*': config.transitions.enter }
                : config.transitions.enter,
            leave: typeof config.transitions.leave === 'function'
                ? { '*': config.transitions.leave }
                : config.transitions.leave,
        } as TransitionalElementConfig['transitions'],
    };
}

export default defineDirective({
    beforeMount(el, { value }) {
        const config = getConfig(value);

        if (!config) {
            return;
        }

        ElementTransitions.registerElementConfig(el, config);
    },
    mounted(el) {
        ElementTransitions.showElement(el);
    },
    beforeUnmount(el) {
        ElementTransitions.hideElement(el);
    },
    updated(el, { value }) {
        const config = getConfig(value);

        if (!config) {
            return;
        }

        ElementTransitions.updateElementConfig(el, config);
    },
});
