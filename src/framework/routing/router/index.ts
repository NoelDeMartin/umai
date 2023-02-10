import { applyMixins, fail, tap } from '@noeldemartin/utils';
import { createRouter, onBeforeRouteLeave, onBeforeRouteUpdate, useRoute } from 'vue-router';
import { defineComponent, h, onUnmounted, ref } from 'vue';
import type { Component, ConcreteComponent } from 'vue';
import type { Constructor } from '@noeldemartin/utils';
import type { RouteMeta, RouteRecordRaw, RouterOptions , Router as VueRouter } from 'vue-router';

import Browser from '@/framework/core/facades/Browser';
import FrameworkRouter from '@/framework/routing/router/FrameworkRouter';
import Router from '@/framework/core/facades/Router';
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

function enhanceRouter(router: VueRouter): VueRouter {
    applyMixins(router.constructor as Constructor<VueRouter>, [FrameworkRouter]);

    return tap(router, router => router.initialize());
}

function enhancedRouteComponentSetup(pageComponent: ConcreteComponent, meta?: RouteMeta) {
    const route = useRoute();
    const subscriptions = ref<Function[]>([]);
    const routeParameters = ref<Record<string, unknown> | null>(null);

    function updateRouteParameters() {
        routeParameters.value = resolveRouteParameters();

        if (!routeParameters.value) {
            UI.hideHeader();
        }
    }

    function resolveRouteParameters(): Record<string, unknown> | null {
        try {
            return Object
                .entries(route.params)
                .reduce(
                    (params, [paramName, paramValue]) => {
                        if (Array.isArray(paramValue)) {
                            return params;
                        }

                        const modelBinding = Router.getModelBinding(paramName);

                        if (!modelBinding)
                            return params;

                        return tap(params, params => {
                            params[paramName] = modelBinding.find(paramValue) ?? fail();

                            if (modelBinding.subscribe)
                                subscriptions.value.push(modelBinding.subscribe(paramValue, model => {
                                    if (!routeParameters.value) {
                                        return;
                                    }

                                    if (!model) {
                                        routeParameters.value = null;

                                        return;
                                    }

                                    routeParameters.value[paramName] = new Proxy(model, {});
                                }));
                        });
                    },
                    Object.assign({}, route.params) as Record<string, unknown>,
                );
        } catch (error) {
            return null;
        }
    }

    onBeforeRouteLeave(() => UI.showHeader());
    onBeforeRouteUpdate(() => updateRouteParameters());
    onUnmounted(() => {
        subscriptions.value.forEach(unsubscribe => unsubscribe());
        subscriptions.value = [];
    });

    updateRouteParameters();

    return () => {
        const requiredIndexedDB = meta?.requiresIndexedDB ?? true;

        if (requiredIndexedDB && !Browser.supportsIndexedDB) {
            const report: ErrorReport = {
                title: translate('errors.unsupportedBrowser'),
                description: translate('errors.unsupportedBrowser_indexedDB'),
            };

            return h(UI.resolveComponent<ConcreteComponent>(ApplicationComponent.ErrorReport), { report });
        }

        if (!routeParameters.value) {
            return h(UI.resolveComponent(ApplicationComponent.NotFound));
        }

        return h(pageComponent, routeParameters.value);
    };
}

function enhanceRouteComponent(pageComponent: ConcreteComponent, meta?: RouteMeta): Component {
    return defineComponent({
        setup() {
            return enhancedRouteComponentSetup(pageComponent, meta);
        },
    });
}

export function createFrameworkRouter(options: RouterOptions): FrameworkRouter & VueRouter {
    options.routes = options.routes.map(enhanceRoute);

    return enhanceRouter(createRouter(options));
}
