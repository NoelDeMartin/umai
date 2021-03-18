import { createApp } from 'vue';
import type { Component , Plugin } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

import {
    authenticators as baseAuthenticators,
    getAuthenticator,
    registerAuthenticator,
    setDefaultAuthenticator,
} from '@/framework/auth';
import { services as baseServices } from '@/framework/core';
import basePlugins from '@/framework/plugins';
import baseRoutes from '@/framework/routing';
import Events from '@/framework/core/facades/Events';
import type { AuthenticatorName } from '@/framework/auth';
import type Authenticator from '@/framework/auth/Authenticator';
import type Service from '@/framework/core/Service';

export type BootstrapApplicationOptions = Partial<{
    selector: string;
    plugins: Plugin[];
    routes: RouteRecordRaw[];
    services: Record<string, Service>;
    authenticators: Record<string, Authenticator>;
    defaultAuthenticator: AuthenticatorName;
    beforeMount(): Promise<void> | void;
}>;

export async function bootstrapApplication(
    rootComponent: Component,
    options: BootstrapApplicationOptions = {},
): Promise<void> {
    const app = createApp(rootComponent);
    const routes = [...options.routes ?? [], ...baseRoutes];
    const plugins = [...basePlugins(routes), ...(options.plugins ?? [])];
    const services = { ...baseServices, ...(options.services ?? {}) };
    const authenticators = { ...baseAuthenticators, ...(options.authenticators ?? {}) };

    plugins.forEach(plugin => app.use(plugin));

    Object.assign(app.config.globalProperties, services);
    Object
        .entries(authenticators)
        .forEach(([name, authenticator]) => registerAuthenticator(name as AuthenticatorName, authenticator));

    setDefaultAuthenticator(getAuthenticator(options.defaultAuthenticator ?? 'localStorage'));

    await Promise.all(Object.entries(services).map(([name, service]) => service.launch(name.slice(1))));
    await options.beforeMount?.call(null);

    app.mount(options.selector ?? '#app');
    Events.emit('application-ready');
}
