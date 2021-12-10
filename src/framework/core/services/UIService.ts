import type { Component } from 'vue';

import NotFound from '@/framework/components/NotFound.vue';
import Service from '@/framework/core/Service';
import type { IService } from '@/framework/core/Service';

interface State {
    components: Record<ApplicationComponents, Component>;
    headerHeight: number;
}

export const enum ApplicationComponents {
    NotFound = 'not-found',
}

export default class UIService extends Service {

    public registerComponent(name: ApplicationComponents, component: Component): void {
        this.components[name] = component;
    }

    public updateHeaderHeight(height: number): void {
        this.setState({ headerHeight: height });
    }

    protected getInitialState(): State {
        return {
            components: {
                [ApplicationComponents.NotFound]: NotFound,
            },
            headerHeight: 0,
        };
    }

}

export default interface UIService extends IService<State> {}
