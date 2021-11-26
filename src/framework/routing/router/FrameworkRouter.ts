import { Storage, once } from '@noeldemartin/utils';
import type { RouteLocationNormalized, RouteLocationRaw, Router } from 'vue-router';
import type { SolidModel } from 'soukai-solid';

const HISTORY_LENGTH = 10;

interface ModelBindingConfiguration {
    find: (param: string) => SolidModel | null;
    subscribe?: (listener: (model: SolidModel | null) => void) => Function;
}

export default class FrameworkRouter {

    private modelBindings: Record<string, ModelBindingConfiguration> = {};
    private runtimeHistory: RouteLocationNormalized[] = [];

    public get previousRoute(): RouteLocationNormalized | null {
        return this.runtimeHistory[1] ?? null;
    }

    public initialize(this: Router): void {
        this.modelBindings = {};
        this.runtimeHistory = [];
        this.beforeEach(once(() => this.handleGithubPagesRedirect()));
        this.beforeEach(route => this.onCurrentRouteChanged(route));
    }

    public registerModelBinding(model: string, resolver: ModelBindingConfiguration): void {
        this.modelBindings[model] = resolver;
    }

    public getModelBinding(model: string): ModelBindingConfiguration | null {
        return this.modelBindings[model] ?? null;
    }

    public hasNavigated(): boolean {
        return this.runtimeHistory.length > 1;
    }

    public previousRouteWas(name: string): boolean {
        return this.previousRoute?.name === name;
    }

    public currentRouteIs(this: Router, name: string): boolean {
        return this.currentRoute.value.name === name;
    }

    private onCurrentRouteChanged(route: RouteLocationNormalized): void {
        this.runtimeHistory.unshift(route);
        this.runtimeHistory.splice(HISTORY_LENGTH);
    }

    private handleGithubPagesRedirect(this: Router): void {
        const route = Storage.pull<RouteLocationRaw>('github-pages-redirect');

        route && this.replace(route);
    }

}
