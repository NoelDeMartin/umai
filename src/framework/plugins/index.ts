import type { Plugin } from 'vue';

import type { AppRoute } from '@/framework/routing/router';

import i18n from './i18n';
import router from './router';
import store from './vuex';

export default async function(routes: AppRoute[]): Promise<Plugin[]> {
    return Promise.all([
        router(routes),
        store(),
        i18n(),
    ]);
}
