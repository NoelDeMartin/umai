import { createRouter, createWebHistory } from 'vue-router';
import { defineComponent, h } from 'vue';
import { Storage, fail, once } from '@noeldemartin/utils';
import type { Component, ComponentOptions , Plugin } from 'vue';
import type { RouteLocationRaw , RouteRecordRaw } from 'vue-router';
import type { SolidModel } from 'soukai-solid';

import Events from '@/framework/core/facades/Events';
import Router from '@/framework/core/facades/Router';
import UI from '@/framework/core/facades/UI';

declare module '@/framework/core' {

    export interface Services {
        $router: NonNullable<typeof Router['instance']>;
    }

}

declare module 'vue-router' {

    export interface Router {

        modelBindings: Record<string, (param: string) => SolidModel | undefined>;
        registerModelBinding(model: string, resolver: (param: string) => SolidModel | undefined): void;

    }

}

const resolveModelBindings = <P>(pageComponent: Component<P>) => defineComponent({
    computed: {
        resolvedParams(): P | null {
            try {
                return Object
                    .entries(this.$route.params)
                    .reduce(
                        (params, [paramName, paramValue]) => {
                            const resolver = this.$router.modelBindings[paramName] ?? null;

                            params[paramName] = resolver
                                ? (resolver(paramValue as string) ?? fail())
                                : paramValue;

                            return params;
                        },
                        {} as Record<string, unknown>,
                    ) as P;
            } catch (error) {
                return null;
            }
        },
    },
    render() {
        return this.resolvedParams
            ? h(pageComponent as ComponentOptions<P>, this.resolvedParams)
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
    Events.on('application-ready', () => {
        Events.on('login', () => Router.replace({ name: 'home' }));
        Events.on('logout', () => Router.replace({ name: 'login' }));
    });

    return router;
}
