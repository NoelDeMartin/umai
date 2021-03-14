import { createRouter, createWebHistory } from 'vue-router';
import { tap } from '@noeldemartin/utils';
import type { Plugin } from 'vue';

import Router from '@/framework/core/facades/Router';
import Events from '@/framework/core/facades/Events';

import { routes } from '@/routing';

declare module '@/framework/core' {

    export interface Services {
        $router: NonNullable<typeof Router['instance']>;
    }

}

export default function(): Plugin {
    return tap(createRouter({ history: createWebHistory(), routes }), router => {
        Router.setInstance(router);
        Events.on('application-ready', () => {
            Events.on('login', () => Router.replace({ name: 'home' }));
            Events.on('logout', () => Router.replace({ name: 'login' }));
        });
    });
}
