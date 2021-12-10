import { bootstrapApplication } from '@/framework';

import './main.css';
import App from './App.vue';
import plugins from './plugins';
import routes, { registerRouterBindings } from './routing';
import services, { registerCloudHandlers } from './services';

export default async function boot(): Promise<void> {
    await bootstrapApplication(App, {
        name: 'Umai',
        plugins,
        services,
        routes,
        beforeLaunch: () => registerCloudHandlers(),
        beforeMount: () => registerRouterBindings(),
    });
}
