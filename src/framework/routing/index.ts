import { h } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

import UI from '@/framework/core/facades/UI';

const routes: RouteRecordRaw[] = [
    {
        name: 'errors.404',
        path: '/:path(.*)*',
        component: { render: () => h(UI.components['not-found']) },
    },
];

export default routes;
