import type { Plugin } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

import router from './router';
import store from './vuex';

export default function(routes: RouteRecordRaw[]): Plugin[] {
    return [
        router(routes),
        store(),
    ];
}
