import { h } from 'vue';

import UI from '@/framework/core/facades/UI';
import { ApplicationComponent } from '@/framework/core/services/UIService';
import { defineRoutes } from '@/framework/routing/router';

export default defineRoutes([
    {
        name: 'errors.404',
        path: '/:path(.*)*',
        component: {
            created: () => UI.hideHeader(),
            beforeRouteLeave: () => UI.showHeader(),
            render: () => h(UI.resolveComponent(ApplicationComponent.NotFound)),
        },
    },
]);
