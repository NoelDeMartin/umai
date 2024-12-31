import { fail } from '@noeldemartin/utils';
import type { RouteLocationRaw } from 'vue-router';

import App from '@/framework/core/facades/App';
import Router from '@/framework/core/facades/Router';
import Service from '@/framework/core/Service';
import type { ComputedStateDefinitions, IService } from '@/framework/core/Service';

import Dish from '@/models/Dish';
import Viewer from '@/services/facades/Viewer';
import type Recipe from '@/models/Recipe';
import type { DishJson } from '@/models/Dish';

interface State {
    dish: Dish | null;
    dismissed: boolean;
    wakeLock: boolean;
    lastRoute: RouteLocationRaw | null;
}

interface ComputedState {
    show: boolean;
}

interface PersistedState {
    dish: DishJson | null;
    wakeLock: boolean;
    lastRoute: RouteLocationRaw | null;
}

export default class CookbookService extends Service<State, ComputedState, PersistedState> {

    public static persist: Array<keyof PersistedState> = ['wakeLock', 'dish', 'lastRoute'];

    private screenLock: Promise<{ release(): Promise<void> }> | null = null;

    public async open(): Promise<void> {
        if (!this.dish) {
            return;
        }

        this.lastRoute = {
            name: Router.currentRoute.value.name ?? fail(),
            params: Router.currentRoute.value.params,
        };

        await Router.push({
            name: 'kitchen.ingredients',
            params: { recipe: this.dish.recipe.slug },
        });
    }

    public async close(): Promise<void> {
        if (!this.lastRoute) {
            return;
        }

        const route = this.lastRoute;
        this.lastRoute = null;

        await Router.push(route);
    }

    public async cook(recipe: Recipe): Promise<void> {
        this.dish = new Dish(recipe);

        this.lockScreen();

        await this.open();
    }

    public async complete(): Promise<void> {
        this.dish = null;

        this.releaseScreen();

        await this.close();
    }

    public dismiss(): void {
        this.dismissed = true;
    }

    protected async boot(): Promise<void> {
        await super.boot();
        await Viewer.booted;

        this.dish && this.lockScreen();
    }

    protected getInitialState(): State {
        return {
            dish: null,
            dismissed: false,
            wakeLock: true,
            lastRoute: null,
        };
    }

    protected getComputedStateDefinitions(): ComputedStateDefinitions<State, ComputedState> {
        return {
            show: ({ dismissed, dish }) => {
                if (!App.isMounted || Viewer.active) {
                    return false;
                }

                if (dish) {
                    return true;
                }

                return !dismissed && Router.currentRouteIs(/^kitchen(\.[^.]+)?|recipes\.show$/);
            },
        };
    }

    protected serializePersistedState(state: Partial<State>): Partial<PersistedState> {
        const persistedState = state as Partial<PersistedState>;

        if (state.dish) {
            persistedState.dish = state.dish.toJson();
        }

        return persistedState;
    }

    protected async restorePersistedState(state: PersistedState): Promise<Partial<State>> {
        return {
            ...state,
            dish: state.dish && await Dish.fromJson(state.dish),
        };
    }

    protected lockScreen(): void {
        const typedNavigator = navigator as {
            wakeLock?: { request(type?: 'screen'): Promise<{ release(): Promise<void> }> };
        };

        if (!typedNavigator.wakeLock) {
            return;
        }

        this.screenLock = typedNavigator.wakeLock.request('screen');
    }

    protected releaseScreen(): void {
        if (!this.screenLock) {
            return;
        }

        this.screenLock.then(lock => lock.release());
        this.screenLock = null;
    }

}

export default interface CookbookService extends IService<State, ComputedState> {}
