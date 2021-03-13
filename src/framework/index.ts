import { createApp } from 'vue';
import type { Component , Plugin } from 'vue';

import basePlugins from '@/framework/plugins';
import baseServices from '@/framework/services';
import Services from '@/framework/services/Services';
import type Service from '@/framework/services/Service';

export type BootstrapApplicationOptions = Partial<{
    selector: string;
    plugins: Plugin[];
    services: Record<string, Service>;
}>;

export async function bootstrapApplication(
    rootComponent: Component,
    options: BootstrapApplicationOptions = {},
): Promise<void> {
    const app = createApp(rootComponent);
    const plugins = [...basePlugins, ...(options.plugins ?? [])];
    const services = { ...baseServices, ...(options.services ?? {}) };

    plugins.forEach(plugin => app.use(plugin));

    Object.assign(Services, services);
    Object.assign(app.config.globalProperties, services);

    await Promise.all(Object.entries(services).map(([name, service]) => service.launch(name.slice(1))));

    app.mount(options.selector ?? '#app');
}
