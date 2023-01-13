import type { App as VueApp } from 'vue';

import { bootstrapApplication } from '@/framework';

import './assets/styles/main.css';
import App from './App.vue';
import plugins from './plugins';
import routes, { registerAutoLinkingScopes, registerRouterBindings } from './routing';
import services, { registerServices } from './services';

interface BootOptions {
    beforeMount(app: VueApp): unknown | Promise<unknown>;
}

export default async function boot({ beforeMount }: Partial<BootOptions> = {}): Promise<void> {
    await bootstrapApplication(App, {
        plugins,
        services,
        routes,
        beforeLaunch: () => registerServices(),
        async beforeMount(app) {
            registerAutoLinkingScopes();
            registerRouterBindings();

            await beforeMount?.(app);
        },
    });
}
