import type { Plugin } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

import i18n from './i18n';
import router from './router';
import store from './vuex';
import type { RouterGuards } from './router';

export default async function(routes: RouteRecordRaw[], guards: Partial<RouterGuards> = {}): Promise<Plugin[]> {
    return Promise.all([
        router(routes, guards),
        store(),
        i18n(),
    ]);
}
