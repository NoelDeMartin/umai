import { noop } from '@noeldemartin/utils';
import type { RouteLocationRaw } from 'vue-router';

import App from '@/framework/core/facades/App';
import Router from '@/framework/core/facades/Router';
import Service from '@/framework/core/Service';

type AutoLinkingScope = (url: string) => RouteLocationRaw | (() => unknown) | boolean | null;

export default class AutoLinkingService extends Service {

    private scopes: Record<string, AutoLinkingScope> = {};
    private capturedTestUrls: string[] = [];

    public captureLink(url: string, scopes?: string | string[] | null): (() => unknown) | null {
        const route = this.getCapturedRoute(url, scopes);

        if (!route) {
            return null;
        }

        if (route === true) {
            return noop;
        }

        if (typeof route === 'function') {
            return route;
        }

        return () => Router.push(route);
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

    protected getCapturedRoute(
        url: string,
        scopes?: string | string[] | null,
    ): RouteLocationRaw | (() => unknown) | boolean | null {
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
