import { h } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

import UI from '@/framework/core/facades/UI';
import { ApplicationComponent } from '@/framework/core/services/UIService';

const routes: RouteRecordRaw[] = [
    {
        name: 'errors.404',
        path: '/:path(.*)*',
        component: { render: () => h(UI.resolveComponent(ApplicationComponent.NotFound)) },
    },
];

export default routes;
