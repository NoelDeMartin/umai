import type { Component } from 'vue';

import NotFound from '@/framework/components/NotFound.vue';
import Service from '@/framework/core/Service';
import type { IService } from '@/framework/core/Service';

interface State {
    components: Record<ApplicationComponents, Component>;
}

export const enum ApplicationComponents {
    NotFound = 'not-found',
}

export default class UIService extends Service {

    registerComponent(name: ApplicationComponents, component: Component): void {
        this.components[name] = component;
    }

    protected getInitialState(): State {
        return {
            components: {
                [ApplicationComponents.NotFound]: NotFound,
            },
        };
    }

}

export default interface UIService extends IService<State> {}
