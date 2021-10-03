import { createRouter, createWebHistory } from 'vue-router';
import { defineComponent, h } from 'vue';
import { Storage, fail, once } from '@noeldemartin/utils';
import type { Component, ComponentOptions, Plugin } from 'vue';
import type { RouteLocationRaw, RouteRecordRaw } from 'vue-router';
import type { SolidModel } from 'soukai-solid';

import Router from '@/framework/core/facades/Router';
import UI from '@/framework/core/facades/UI';

declare module '@/framework/core' {

    export interface Services {
        $router: NonNullable<typeof Router['instance']>;
    }

}

declare module 'vue-router' {

    export interface Router {

        modelBindings: Record<string, ModelBindingConfiguration>;
        registerModelBinding(model: string, configuration: ModelBindingConfiguration): void;

    }

}

interface ModelBindingConfiguration {
    find: (param: string) => SolidModel | null;
    subscribe?: (listener: (model: SolidModel | null) => void) => Function;
}

const resolveModelBindings = <P>(pageComponent: Component<P>) => defineComponent({
    data: () => ({
        subscriptions: [] as Function[],
        routeParameters: null as Record<string, unknown> | null,
    }),
    created() {
        this.routeParameters = this.resolveRouteParameters();

        // TODO watch route params
    },
    unmounted() {
        this.clearSubscriptions();
    },
    methods: {
        clearSubscriptions() {
            this.subscriptions.forEach(unsubscribe => unsubscribe());
            this.subscriptions = [];
        },
        resolveRouteParameters(): Record<string, unknown> | null {
            try {
                return Object
                    .entries(this.$route.params)
                    .reduce(
                        (params, [paramName, paramValue]) => {
                            if (!(paramName in this.$router.modelBindings))
                                return params;

                            const { find, subscribe } = this.$router.modelBindings[paramName];

                            params[paramName] = find(paramValue as string) ?? fail();

                            subscribe && this.subscriptions.push(subscribe(model => {
                                if (!this.routeParameters)
                                    return;

                                if (!model) {
                                    this.routeParameters = null;

                                    return;
                                }

                                this.routeParameters[paramName] = new Proxy(model, {});
                            }));

                            return params;
                        },
                        Object.assign({}, this.$route.params) as Record<string, unknown>,
                    );
            } catch (error) {
                return null;
            }
        },
    },
    render() {
        return this.routeParameters
            ? h(pageComponent as ComponentOptions<P>, this.routeParameters as P)
            : h(UI.components['not-found']);
    },
});

function enhanceRoute(route: RouteRecordRaw): RouteRecordRaw {
    if (route.component)
        route.component = resolveModelBindings(route.component);

    return route;
}

function handleGithubPagesRedirect(): void {
    const route = Storage.pull<RouteLocationRaw>('github-pages-redirect');

    route && Router.replace(route);
}

export default function(routes: RouteRecordRaw[]): Plugin {
    const router = createRouter({
        history: createWebHistory(),
        routes: routes.map(route => enhanceRoute(route)),
    });

    router.modelBindings = {};
    router.registerModelBinding = (model, resolver) => router.modelBindings[model] = resolver;
    router.beforeEach(once(handleGithubPagesRedirect));

    Router.setInstance(router);

    return router;
}
