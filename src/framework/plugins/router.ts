import { createWebHistory } from 'vue-router';
import { tap } from '@noeldemartin/utils';
import type { NavigationGuard, RouteRecordRaw, Router as VueRouter } from 'vue-router';
import type { Plugin } from 'vue';

import Router from '@/framework/core/facades/Router';
import { createFrameworkRouter } from '@/framework/routing/router';
import type FrameworkRouter from '@/framework/routing/router/FrameworkRouter';

declare module '@/framework/core' {

    export interface Services {
        $router: VueRouter;
    }

}

declare module 'vue-router' {

    export interface Router extends FrameworkRouter { }

}

export interface RouterGuards {
    beforeEach?: NavigationGuard;
}

export default function(routes: RouteRecordRaw[], guards: Partial<RouterGuards> = {}): Plugin {
    const history = createWebHistory();

    return tap(createFrameworkRouter({ history, routes }), router => {
        guards.beforeEach && router.beforeEach(guards.beforeEach);
        Router.setInstance(router);
    });
}
