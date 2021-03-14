import { createApp } from 'vue';
import type { Component , Plugin } from 'vue';

import {
    authenticators as baseAuthenticators,
    getAuthenticator,
    registerAuthenticator,
    setDefaultAuthenticator,
} from '@/framework/auth';
import { services as baseServices } from '@/framework/core';
import basePlugins from '@/framework/plugins';
import Events from '@/framework/core/facades/Events';
import type { AuthenticatorName } from '@/framework/auth';
import type Authenticator from '@/framework/auth/Authenticator';
import type Service from '@/framework/core/Service';

export type BootstrapApplicationOptions = Partial<{
    selector: string;
    plugins: Plugin[];
    services: Record<string, Service>;
    authenticators: Record<string, Authenticator>;
    defaultAuthenticator: AuthenticatorName;
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

    Object.assign(app.config.globalProperties, services);
    Object
        .entries(authenticators)
        .forEach(([name, authenticator]) => registerAuthenticator(name as AuthenticatorName, authenticator));

    setDefaultAuthenticator(getAuthenticator(options.defaultAuthenticator ?? 'localStorage'));

    await Promise.all(Object.entries(services).map(([name, service]) => service.launch(name.slice(1))));

    app.mount(options.selector ?? '#app');
}
