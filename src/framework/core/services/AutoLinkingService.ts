import { noop } from '@noeldemartin/utils';
import type { RouteLocationRaw } from 'vue-router';

import App from '@/framework/core/facades/App';
import Router from '@/framework/core/facades/Router';
import Service from '@/framework/core/Service';

export type AutoLinkingScope = (url: string) => CapturedRoute | Promise<CapturedRoute>;
export type CapturedRoute = RouteLocationRaw | (() => unknown) | boolean | null;
export type LinkCapture = (() => unknown) | null;

export default class AutoLinkingService extends Service {

    private scopes: Record<string, AutoLinkingScope> = {};
    private capturedTestUrls: string[] = [];

    public captureLink(url: string, scopes?: string | string[] | null): LinkCapture | Promise<LinkCapture> {
        const route = this.getCapturedRoute(url, scopes);
        const handleCapturedRoute = (capturedRoute: CapturedRoute) => {
            if (!capturedRoute) {
                return null;
            }

            if (capturedRoute === true) {
                return noop;
            }

            if (typeof capturedRoute === 'function') {
                return capturedRoute;
            }

            return () => Router.push(capturedRoute);
        };

        return route instanceof Promise
            ? Promise.resolve(route).then(capturedRoute => handleCapturedRoute(capturedRoute))
            : handleCapturedRoute(route);
    }

    public registerScope(name: string, scope: AutoLinkingScope): void {
        this.scopes[name] = scope;
    }

    public hasCapturedDuringTesting(url: string): boolean {
        return this.capturedTestUrls.includes(url);
    }

    protected async boot(): Promise<void> {
        await super.boot();

        this.registerScope('default', url => {
            if (!url.startsWith(document.location.origin)) {
                return false;
            }

            return { path: url.slice(document.location.origin.length) };
        });
    }

    protected getCapturedRoute(url: string, scopes?: string | string[] | null): CapturedRoute | Promise<CapturedRoute> {
        const enabledScopes = this.getScopeNames(scopes);

        for (const [name, scope] of Object.entries(this.scopes)) {
            if (!enabledScopes.includes(name)) {
                continue;
            }

            const route = scope(url);

            if (!route) {
                continue;
            }

            return route;
        }

        if (App.isTesting) {
            this.capturedTestUrls.push(url);

            return true;
        }

        return null;
    }

    protected getScopeNames(scopes?: string | string[] | null): string[] {
        if (!scopes) {
            return Object.keys(this.scopes);
        }

        if (typeof scopes === 'string') {
            return scopes.split(',').map(scope => scope.trim());
        }

        return scopes;
    }

}
