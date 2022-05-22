import type { Plugin } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

import i18n from './i18n';
import router from './router';
import store from './vuex';

export default async function(routes: RouteRecordRaw[]): Promise<Plugin[]> {
    return Promise.all([router(routes), store(), i18n()]);
}
