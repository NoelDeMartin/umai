import { bootstrapApplication } from '@/framework';

import './assets/styles/main.css';
import App from './App.vue';
import plugins from './plugins';
import routes, { registerRouterBindings } from './routing';
import services, { registerServices } from './services';

export default async function boot(): Promise<void> {
    await bootstrapApplication(App, {
        name: 'Umai',
        plugins,
        services,
        routes,
        beforeLaunch: () => registerServices(),
        beforeMount: () => registerRouterBindings(),
    });
}
