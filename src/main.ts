import { bootstrapApplication } from '@/framework';

import App from './App.vue';
import plugins from './plugins';
import services from './services';
import { registerRouterBindings, routes } from './routing';

bootstrapApplication(App, {
    plugins,
    services,
    routes,

    beforeMount() {
        registerRouterBindings();
    },
});
