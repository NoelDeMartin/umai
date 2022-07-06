import { createApp } from 'vue';
import { tap } from '@noeldemartin/utils';
import type { Component, Directive, Plugin, App as VueApp } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

import App from '@/framework/core/facades/App';
import getBasePlugins from '@/framework/plugins';
import baseComponents from '@/framework/components/headless';
import baseDirectives from '@/framework/directives';
import baseRoutes from '@/framework/routing';
import Errors from '@/framework/core/facades/Errors';
import Events from '@/framework/core/facades/Events';
import {
    authenticators as baseAuthenticators,
    getAuthenticator,
    registerAuthenticator,
    setDefaultAuthenticator,
} from '@/framework/auth';
import { services as baseServices } from '@/framework/core';
import type Authenticator from '@/framework/auth/Authenticator';
import type Service from '@/framework/core/Service';
import type { AuthenticatorName } from '@/framework/auth';
import type { ErrorReason } from '@/framework/core/services/ErrorsService';

type ErrorHandler = (error: ErrorReason) => boolean;

const frameworkHandler: ErrorHandler = error => {
    if (!Errors.instance) {
        // eslint-disable-next-line no-console
        console.warn('Errors service hasn\'t been initialized properly!');

        // eslint-disable-next-line no-console
        console.error(error);

        return true;
    }

    Errors.report(error);

    return true;
};

function setUpErrorHandler(baseHandler: ErrorHandler = (() => false)): ErrorHandler {
    return tap(error => baseHandler(error) || frameworkHandler(error), errorHandler => {
        window.onerror = (message, _, __, ___, error) => errorHandler(error ?? message);
        window.onunhandledrejection = event => errorHandler(event.reason);
    });
}

declare module '@/framework/core/services/EventsService' {

    export interface EventsPayload {
        'application-ready': void;
    }

}

export type BootstrapApplicationOptions = Partial<{
    name: string;
    selector: string;
    plugins: Plugin[];
    components: Record<string, Component>;
    directives: Record<string, Directive>;
    routes: RouteRecordRaw[];
    services: Record<string, Service>;
    authenticators: Record<string, Authenticator>;
    defaultAuthenticator: AuthenticatorName;
    handleError(error: ErrorReason): boolean;
    beforeLaunch(app: VueApp): Promise<unknown> | unknown;
    beforeMount(app: VueApp): Promise<unknown> | unknown;
}>;

export async function bootstrapApplication(
    rootComponent: Component,
    options: BootstrapApplicationOptions = {},
): Promise<void> {
    const errorHandler = setUpErrorHandler(options.handleError);
    const app = createApp(rootComponent);
    const routes = [...options.routes ?? [], ...baseRoutes];
    const basePlugins = await getBasePlugins(routes);
    const plugins = [...basePlugins, ...(options.plugins ?? [])];
    const components = { ...baseComponents, ...(options.components ?? {}) };
    const directives = { ...baseDirectives, ...(options.directives ?? {}) };
    const services = { ...baseServices, ...(options.services ?? {}) };
    const authenticators = { ...baseAuthenticators, ...(options.authenticators ?? {}) };

    App.name = options.name ?? App.name;
    app.config.errorHandler = errorHandler;

    plugins.forEach(plugin => app.use(plugin));

    Object.assign(app.config.globalProperties, services);
    Object.entries(components).forEach(([name, component]) => app.component(name, component));
    Object.entries(directives).forEach(([name, directive]) => app.directive(name, directive));
    Object
        .entries(authenticators)
        .forEach(([name, authenticator]) => registerAuthenticator(name as AuthenticatorName, authenticator));

    setDefaultAuthenticator(getAuthenticator(options.defaultAuthenticator ?? 'inrupt'));

    await options.beforeLaunch?.(app);
    await Promise.all(Object.entries(services).map(([name, service]) => service.launch(name.slice(1))));
    await options.beforeMount?.(app);

    app.mount(options.selector ?? '#app');
    app._container?.classList.remove('loading');

    Events.emit('application-ready');
}
