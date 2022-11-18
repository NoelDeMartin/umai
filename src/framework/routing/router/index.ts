import { applyMixins, fail, tap } from '@noeldemartin/utils';
import { createRouter } from 'vue-router';
import { defineComponent, h } from 'vue';
import type { Component, ConcreteComponent } from 'vue';
import type { Constructor } from '@noeldemartin/utils';
import type { RouteMeta, RouteRecordRaw, Router, RouterOptions } from 'vue-router';

import Browser from '@/framework/core/facades/Browser';
import FrameworkRouter from '@/framework/routing/router/FrameworkRouter';
import UI from '@/framework/core/facades/UI';
import { ApplicationComponent } from '@/framework/core/services/UIService';
import { translate } from '@/framework/utils/translate';
import type { ErrorReport } from '@/framework/core/services/ErrorsService';

function enhanceRoute(route: RouteRecordRaw): RouteRecordRaw {
    if (typeof route.component === 'function') {
        const lazyComponent = route.component as () => Promise<{ default: ConcreteComponent }>;

        return tap(route, route => {
            route.component = async () => {
                const { default: component } = await lazyComponent();

                return enhanceRouteComponent(component, route.meta);
            };
        });
    }

    if (route.component) {
        return tap(route, route => {
            route.component = enhanceRouteComponent(route.component as ConcreteComponent, route.meta);
        });
    }

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

function enhanceRouteComponent(pageComponent: ConcreteComponent, meta?: RouteMeta): Component {
    return defineComponent({
        data: () => ({
            subscriptions: [] as Function[],
            routeParameters: null as Record<string, unknown> | null,
        }),
        created() {
            this.updateRouteParameters();
        },
        unmounted() {
            this.clearSubscriptions();
        },
        beforeRouteEnter(...args) {
            return callMethod(pageComponent, 'beforeRouteEnter', this, args);
        },
        beforeRouteUpdate(...args) {
            this.updateRouteParameters();

            return callMethod(pageComponent, 'beforeRouteUpdate', this, args);
        },
        beforeRouteLeave(...args) {
            UI.showHeader();

            return callMethod(pageComponent, 'beforeRouteLeave', this, args);
        },
        methods: {
            clearSubscriptions() {
                this.subscriptions.forEach(unsubscribe => unsubscribe());
                this.subscriptions = [];
            },
            updateRouteParameters(): void {
                this.routeParameters = this.resolveRouteParameters();

                if (!this.routeParameters) {
                    UI.hideHeader();
                }
            },
            resolveRouteParameters(): Record<string, unknown> | null {
                try {
                    return Object
                        .entries(this.$route.params)
                        .reduce(
                            (params, [paramName, paramValue]) => {
                                if (Array.isArray(paramValue)) {
                                    return params;
                                }

                                const modelBinding = this.$router.getModelBinding(paramName);

                                if (!modelBinding)
                                    return params;

                                return tap(params, params => {
                                    params[paramName] = modelBinding.find(paramValue) ?? fail();

                                    if (modelBinding.subscribe)
                                        this.subscriptions.push(modelBinding.subscribe(paramValue, model => {
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
            const requiredIndexedDB = meta?.requiresIndexedDB ?? true;

            if (requiredIndexedDB && !Browser.supportsIndexedDB) {
                const report: ErrorReport = {
                    title: translate('errors.unsupportedBrowser'),
                    description: translate('errors.unsupportedBrowser_indexedDB'),
                };

                return h(UI.resolveComponent<ConcreteComponent>(ApplicationComponent.ErrorReport), { report });
            }

            if (!this.routeParameters) {
                return h(UI.resolveComponent(ApplicationComponent.NotFound));
            }

            return h(pageComponent, this.routeParameters);
        },
    });
}

export function createFrameworkRouter(options: RouterOptions): FrameworkRouter & Router {
    options.routes = options.routes.map(enhanceRoute);

    return enhanceRouter(createRouter(options));
}
