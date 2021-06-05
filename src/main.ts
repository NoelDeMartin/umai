import { bootstrapApplication } from '@/framework';

import App from './App.vue';
import plugins from './plugins';
import routes, { registerRouterBindings } from './routing';
import services, { registerCloudHandlers } from './services';

bootstrapApplication(App, {
    name: 'Umai',
    plugins,
    services,
    routes,
    beforeLaunch: () => registerCloudHandlers(),
    beforeMount: () => registerRouterBindings(),
});
