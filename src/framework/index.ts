import { createApp } from 'vue';
import type { Component, Directive, Plugin } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

import {
    authenticators as baseAuthenticators,
    getAuthenticator,
    registerAuthenticator,
    setDefaultAuthenticator,
} from '@/framework/auth';
import { services as baseServices } from '@/framework/core';
import App from '@/framework/core/facades/App';
import getBasePlugins from '@/framework/plugins';
import baseDirectives from '@/framework/directives';
import baseRoutes from '@/framework/routing';
import Events from '@/framework/core/facades/Events';
import type { AuthenticatorName } from '@/framework/auth';
import type Authenticator from '@/framework/auth/Authenticator';
import type Service from '@/framework/core/Service';

declare module '@/framework/core/services/EventsService' {

    export interface EventsPayload {
        'application-ready': void;
    }

}

export type BootstrapApplicationOptions = Partial<{
    name: string;
    selector: string;
    plugins: Plugin[];
    directives: Record<string, Directive>;
    routes: RouteRecordRaw[];
    services: Record<string, Service>;
    authenticators: Record<string, Authenticator>;
    defaultAuthenticator: AuthenticatorName;
    beforeLaunch(): Promise<unknown> | unknown;
    beforeMount(): Promise<unknown> | unknown;
}>;

export async function bootstrapApplication(
    rootComponent: Component,
    options: BootstrapApplicationOptions = {},
): Promise<void> {
    const app = createApp(rootComponent);
    const routes = [...options.routes ?? [], ...baseRoutes];
    const basePlugins = await getBasePlugins(routes);
    const plugins = [...basePlugins, ...(options.plugins ?? [])];
    const directives = { ...baseDirectives, ...(options.directives ?? {}) };
    const services = { ...baseServices, ...(options.services ?? {}) };
    const authenticators = { ...baseAuthenticators, ...(options.authenticators ?? {}) };

    App.name = options.name ?? App.name;

    plugins.forEach(plugin => app.use(plugin));

    Object.assign(app.config.globalProperties, services);
    Object
        .entries(directives)
        .forEach(([name, directive]) => app.directive(name, directive));
    Object
        .entries(authenticators)
        .forEach(([name, authenticator]) => registerAuthenticator(name as AuthenticatorName, authenticator));

    setDefaultAuthenticator(getAuthenticator(options.defaultAuthenticator ?? 'inrupt'));

    await options.beforeLaunch?.call(null);
    await Promise.all(Object.entries(services).map(([name, service]) => service.launch(name.slice(1))));
    await options.beforeMount?.call(null);

    app.mount(options.selector ?? '#app');
    app._container?.classList.remove('loading');

    Events.emit('application-ready');
}
