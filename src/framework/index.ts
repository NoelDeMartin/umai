import { createApp } from 'vue';
import type { Component , Plugin } from 'vue';

import { services as baseServices } from '@/framework/core';
import { authenticators as baseAuthenticators } from '@/framework/auth';
import Authenticators from '@/framework/auth/Authenticators';
import basePlugins from '@/framework/plugins';
import Services from '@/framework/core/Services';
import type { AuthenticatorName } from '@/framework/auth/Authenticators';
import type Authenticator from '@/framework/auth/Authenticator';
import type Service from '@/framework/core/Service';

export type BootstrapApplicationOptions = Partial<{
    selector: string;
    plugins: Plugin[];
    services: Record<string, Service>;
    authenticators: Record<string, Authenticator>;
    defaultAuthenticator: keyof typeof Authenticators;
}>;

export async function bootstrapApplication(
    rootComponent: Component,
    options: BootstrapApplicationOptions = {},
): Promise<void> {
    const app = createApp(rootComponent);
    const plugins = [...basePlugins, ...(options.plugins ?? [])];
    const services = { ...baseServices, ...(options.services ?? {}) };
    const authenticators = { ...baseAuthenticators, ...(options.authenticators ?? {}) };

    plugins.forEach(plugin => app.use(plugin));

    Object.assign(Authenticators, authenticators);
    Object.assign(Services, services);
    Object.assign(app.config.globalProperties, services);
    Object.entries(authenticators).forEach(([name, authenticator]) => authenticator.name = name as AuthenticatorName);

    Authenticators.default = Authenticators[options.defaultAuthenticator ?? 'localStorage'];

    await Promise.all(Object.entries(services).map(([name, service]) => service.launch(name.slice(1))));

    app.mount(options.selector ?? '#app');
}
