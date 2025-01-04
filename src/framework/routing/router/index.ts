import { objectWithout, tap } from '@noeldemartin/utils';
import { createRouter, onBeforeRouteLeave, onBeforeRouteUpdate, useRoute } from 'vue-router';
import { computed, defineComponent, h, onUnmounted, ref, watch } from 'vue';
import type { Component, ConcreteComponent } from 'vue';
import type {
    RouteLocationNormalizedLoaded,
    RouteLocationRaw,
    RouteMeta,
    RouteRecordRaw ,
    RouterOptions,
    Router as VueRouter,
} from 'vue-router';

import App from '@/framework/core/facades/App';
import Browser from '@/framework/core/facades/Browser';
import FrameworkRouter from '@/framework/routing/router/FrameworkRouter';
import Router from '@/framework/core/facades/Router';
import UI from '@/framework/core/facades/UI';
import { ApplicationComponent } from '@/framework/core/services/UIService';
import { translate } from '@/framework/utils/translate';
import type { ErrorReport } from '@/framework/core/services/ErrorsService';

type RouteParameters = Record<string, unknown> | null;

export interface AppRouteMeta<T extends Record<string, unknown> = Record<string, unknown>> extends RouteMeta {
    title?: string | ((params: T) => string);
    requiresIndexedDB?: boolean;
}

export type AppRoute = RouteRecordRaw & {
    meta?: AppRouteMeta;
};

function enhanceRoute(route: AppRoute): AppRoute {
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
    const originalReplace = router.replace;
    const mixinDescriptors = objectWithout(
        Object.getOwnPropertyDescriptors(FrameworkRouter.prototype),
        ['constructor'],
    );

    for (const [propertyName, propertyDescriptor] of Object.entries(mixinDescriptors)) {
        Object.defineProperty(router, propertyName, propertyDescriptor);
    }

    return tap(router, router => router.initialize(originalReplace));
}

function routeParametersMissing(routeParameters: RouteParameters): routeParameters is null {
    return !routeParameters || Object.values(routeParameters).some(binding => !binding);
}

function enhancedRouteComponentSetup(pageComponent: ConcreteComponent, meta?: AppRouteMeta) {
    const route = useRoute();
    const subscriptions = ref<Function[]>([]);
    const routeParameters = ref<RouteParameters>(null);
    const routeTitle = computed(() => {
        if (!meta?.title) {
            return null;
        }

        if (typeof meta.title === 'string') {
            return meta.title;
        }

        if (routeParametersMissing(routeParameters.value)) {
            return null;
        }

        return meta.title(routeParameters.value);
    });

    function updateRouteParameters() {
        routeParameters.value = resolveRouteParameters();

        if (routeParametersMissing(routeParameters.value)) {
            UI.hideHeader();
        } else {
            UI.restoreHeader();
        }
    }

    function resolveRouteParameters(): RouteParameters {
        try {
            return Object
                .entries(route.params)
                .reduce(
                    (params, [paramName, paramValue]) => {
                        if (Array.isArray(paramValue)) {
                            return params;
                        }

                        const modelBinding = Router.getModelBinding(paramName);

                        if (!modelBinding) {
                            return params;
                        }

                        return tap(params, params => {
                            params[paramName] = modelBinding.find(paramValue);

                            if (modelBinding.subscribe) {
                                subscriptions.value.push(modelBinding.subscribe(paramValue, model => {
                                    if (!routeParameters.value) {
                                        return;
                                    }

                                    if (!model) {
                                        routeParameters.value[paramName] = null;

                                        return;
                                    }

                                    routeParameters.value[paramName] = new Proxy(model, {});
                                }));
                            }
                        });
                    },
                    Object.assign({}, route.params) as Record<string, unknown>,
                );
        } catch (error) {
            return null;
        }
    }

    watch(routeTitle, title => updateRouteTitle(title), { immediate: true });
    onBeforeRouteLeave(() => UI.restoreHeader());
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

        if (routeParametersMissing(routeParameters.value)) {
            return h(UI.resolveComponent(ApplicationComponent.NotFound));
        }

        return h(pageComponent, routeParameters.value);
    };
}

function enhanceRouteComponent(pageComponent: ConcreteComponent, meta?: AppRouteMeta): Component {
    return defineComponent({
        setup() {
            return enhancedRouteComponentSetup(pageComponent, meta);
        },
    });
}

export function serializeRoute(route: RouteLocationNormalizedLoaded): RouteLocationRaw {
    return {
        path: route.path,
        query: route.query,
        hash: route.hash,
        params: route.params,
    };
}

export function updateRouteTitle(title?: string | null): void {
    if (!title) {
        document.title = App.name;

        return;
    }

    document.title = `${title} | ${App.name}`;
}

export function defineRoutes(routes: AppRoute[]): AppRoute[] {
    return routes;
}

export function routeMeta<T extends Record<string, unknown>>(meta: AppRouteMeta<T>): AppRouteMeta {
    return meta as AppRouteMeta;
}

export function createFrameworkRouter(options: RouterOptions): FrameworkRouter & VueRouter {
    options.routes = options.routes.map(enhanceRoute);

    return enhanceRouter(createRouter(options));
}
