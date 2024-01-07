import { Storage, fail, once, toString } from '@noeldemartin/utils';
import type {
    NavigationFailure,
    RouteLocationNormalized,
    RouteLocationNormalizedLoaded,
    RouteLocationRaw,
    Router,
} from 'vue-router';
import type { SolidModel } from 'soukai-solid';

const HISTORY_LENGTH = 10;

interface ModelBindingConfiguration {
    find: (param: string) => SolidModel | null;
    subscribe?: (param: string, listener: (model: SolidModel | null) => void) => Function;
}

export default class FrameworkRouter {

    private _modelBindings?: Record<string, ModelBindingConfiguration>;
    private _runtimeHistory?: RouteLocationNormalized[];
    private _replacements?: WeakMap<RouteLocationNormalizedLoaded, RouteLocationRaw>;
    private _originalReplace?: Router['replace'];

    public get previousRoute(): RouteLocationNormalized | null {
        return this.runtimeHistory?.[1] ?? null;
    }

    private get modelBindings(): Record<string, ModelBindingConfiguration> {
        return this._modelBindings ?? fail('modelBindings not initialized in framework router');
    }

    private get runtimeHistory(): RouteLocationNormalized[] {
        return this._runtimeHistory ?? fail('runtimeHistory not initialized in framework router');
    }

    private get replacements(): WeakMap<RouteLocationNormalizedLoaded, RouteLocationRaw> {
        return this._replacements ?? fail('replacements not initialized in framework router');
    }

    private get originalReplace(): Router['replace'] {
        return this._originalReplace ?? fail('originalReplace not initialized in framework router');
    }

    public initialize(this: Router, originalReplace: Router['replace']): void {
        this._modelBindings = {};
        this._runtimeHistory = [];
        this._replacements = new WeakMap();
        this._originalReplace = originalReplace;
        this.beforeEach(once(() => this.handleGithubPagesRedirect()));
        this.beforeEach(route => this.onCurrentRouteChanged(route));
    }

    public registerModelBinding(model: string, resolver: ModelBindingConfiguration): void {
        this.modelBindings[model] = resolver;
    }

    public getModelBinding(model: string): ModelBindingConfiguration | null {
        return this.modelBindings[model] ?? null;
    }

    public getQueryParam<T = Record<string, unknown>, K extends keyof T = keyof T>(this: Router, param: K): T[K] {
        return this.getQueryParams<T>()[param];
    }

    public getQueryParams<T = Record<string, unknown>>(this: Router): T {
        return this.currentRoute.value.query as unknown as T;
    }

    public hasNavigated(): boolean {
        return this.runtimeHistory.length > 1;
    }

    public previousRouteWas(name: string): boolean {
        return this.previousRoute?.name === name;
    }

    public currentRouteIs(this: Router, name: string | RegExp): boolean {
        if (typeof name === 'string') {
            return this.currentRoute.value.name === name;
        }

        return name.test(toString(this.currentRoute.value.name));
    }

    public async replace(this: Router, to: RouteLocationRaw): Promise<NavigationFailure | void | undefined> {
        this.replacements.set(this.currentRoute.value, to);

        return this.originalReplace.call(this, to);
    }

    private onCurrentRouteChanged(route: RouteLocationNormalized): void {
        const lastRoute = this.runtimeHistory[0];

        if (lastRoute && this.replacements.get(lastRoute)) {
            this.runtimeHistory[0] = route;
            this.replacements.delete(lastRoute);

            return;
        }

        this.runtimeHistory.unshift(route);
        this.runtimeHistory.splice(HISTORY_LENGTH);
    }

    private handleGithubPagesRedirect(this: Router): void {
        const route = Storage.pull<RouteLocationRaw>('github-pages-redirect');

        route && this.replace(route);
    }

}
