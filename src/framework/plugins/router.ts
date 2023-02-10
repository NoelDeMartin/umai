import { createWebHistory } from 'vue-router';
import { tap } from '@noeldemartin/utils';
import type { Router as VueRouter } from 'vue-router';
import type { Plugin } from 'vue';

import Router from '@/framework/core/facades/Router';
import { createFrameworkRouter } from '@/framework/routing/router';
import type FrameworkRouter from '@/framework/routing/router/FrameworkRouter';
import type { AppRoute } from '@/framework/routing/router';

declare module '@/framework/core' {

    export interface Services {
        $router: VueRouter;
    }

}

declare module 'vue-router' {

    export interface Router extends FrameworkRouter { }

}

export default function(routes: AppRoute[]): Plugin {
    const history = createWebHistory();

    return tap(createFrameworkRouter({ history, routes }), router => Router.setInstance(router));
}
