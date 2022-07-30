import { applyMixins, fail, tap } from '@noeldemartin/utils';
import { createRouter } from 'vue-router';
import { defineComponent, h } from 'vue';
import type { Component, ComponentOptions } from 'vue';
import type { Constructor } from '@noeldemartin/utils';
import type { RouteRecordRaw, Router, RouterOptions } from 'vue-router';

import FrameworkRouter from '@/framework/routing/router/FrameworkRouter';
import UI from '@/framework/core/facades/UI';
import { ApplicationComponent } from '@/framework/core/services/UIService';

function enhanceRoute(route: RouteRecordRaw): RouteRecordRaw {
    if (route.component)
        route.component = enhanceRouteComponent(route.component);

    return route;
}

function enhanceRouter(router: Router): Router {
    applyMixins(router.constructor as Constructor<Router>, [FrameworkRouter]);

    return tap(router, router => router.initialize());
}

function callMethod<T extends string>(
    target: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    method: T,
    scope: unknown,
    args: unknown[],
) {
    return target[method]?.call(scope, ...args);
}

function enhanceRouteComponent<P>(pageComponent: Component<P>): Component {
    return defineComponent({
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
        beforeRouteEnter(...args) {
            return callMethod(pageComponent, 'beforeRouteEnter', this, args);
        },
        beforeRouteUpdate(...args) {
            return callMethod(pageComponent, 'beforeRouteUpdate', this, args);
        },
        beforeRouteLeave(...args) {
            return callMethod(pageComponent, 'beforeRouteLeave', this, args);
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
                                const modelBinding = this.$router.getModelBinding(paramName);

                                if (!modelBinding)
                                    return params;

                                return tap(params, params => {
                                    params[paramName] = modelBinding.find(paramValue as string) ?? fail();

                                    if (modelBinding.subscribe)
                                        this.subscriptions.push(modelBinding.subscribe(model => {
                                            if (!this.routeParameters)
                                                return;

                                            if (!model) {
                                                this.routeParameters = null;

                                                return;
                                            }

                                            this.routeParameters[paramName] = new Proxy(model, {});
                                        }));
                                });
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
                : h(UI.resolveComponent(ApplicationComponent.NotFound));
        },
    });
}

export function createFrameworkRouter(options: RouterOptions): FrameworkRouter & Router {
    options.routes = options.routes.map(enhanceRoute);

    return enhanceRouter(createRouter(options));
}
