import { arrayWithout, fail } from '@noeldemartin/utils';
import { toRaw } from 'vue';
import type { RouteLocationRaw } from 'vue-router';

import App from '@/framework/core/facades/App';
import Errors from '@/framework/core/facades/Errors';
import Events from '@/framework/core/facades/Events';
import Router from '@/framework/core/facades/Router';
import Service from '@/framework/core/Service';
import UI from '@/framework/core/facades/UI';
import type { ComputedStateDefinitions, IService } from '@/framework/core/Service';

import Dish from '@/models/Dish';
import Timer from '@/models/Timer';
import Viewer from '@/services/facades/Viewer';
import KitchenTimeoutModal from '@/routing/pages/kitchen/components/modals/KitchenTimeoutModal.vue';
import type Recipe from '@/models/Recipe';
import type { DishJson } from '@/models/Dish';
import type { TimerJson } from '@/models/Timer';

interface State {
    dish: Dish | null;
    timers: Timer[];
    dismissed: boolean;
    wakeLock: boolean;
    lastRoute: RouteLocationRaw | null;
}

interface ComputedState {
    show: boolean;
}

interface PersistedState {
    dish: DishJson | null;
    timers: TimerJson[];
    wakeLock: boolean;
    lastRoute: RouteLocationRaw | null;
}

export default class CookbookService extends Service<State, ComputedState, PersistedState> {

    public static persist: Array<keyof PersistedState> = ['dish', 'timers', 'wakeLock', 'lastRoute'];

    private screenLock: Promise<void | { release(): Promise<void> }> | null = null;
    private timeouts: WeakMap<Timer, ReturnType<typeof setTimeout>> = new WeakMap();

    public async open(): Promise<void> {
        if (!this.dish) {
            return;
        }

        this.lastRoute = {
            name: Router.currentRoute.value.name ?? fail(),
            params: Router.currentRoute.value.params,
        };

        await Router.push(this.dish.getStageRoute());
    }

    public async close(): Promise<void> {
        if (!this.lastRoute) {
            return;
        }

        const route = this.lastRoute;
        this.lastRoute = null;

        await Router.push(toRaw(route));
    }

    public async cook(recipe: Recipe): Promise<void> {
        this.dish = new Dish(recipe);

        this.lockScreen();

        this.dish.listeners.add({ onUpdated: () => this.setState({ dish: this.dish }) });

        await this.open();
    }

    public addTimer(timer: Timer): void {
        this.timers = this.timers.concat([timer]);

        timer.listeners.add({
            onUpdated: () => this.onTimerUpdated(),
            onStartedRunning: () => this.onTimerStarted(timer),
            onStoppedRunning: () => this.onTimerStopped(timer),
        });
    }

    public removeTimer(timer: Timer): void {
        this.timers = arrayWithout(this.timers, timer);

        timer.stop();
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

        Events.on('logout', () => {
            this.timers.forEach(timer => this.onTimerStopped(timer));

            this.setState({ dish: null, timers: [], lastRoute: null });
        });

        if (this.dish) {
            this.lockScreen();

            this.dish.listeners.add({ onUpdated: () => this.setState({ dish: this.dish }) });

            this.timers.forEach(timer => {
                timer.listeners.add({
                    onUpdated: () => this.onTimerUpdated(),
                    onStartedRunning: () => this.onTimerStarted(timer),
                    onStoppedRunning: () => this.onTimerStopped(timer),
                });

                if (timer.isRunning() && !timer.isOverTime()) {
                    this.onTimerStarted(timer);
                }
            });
        }
    }

    protected getInitialState(): State {
        return {
            dish: null,
            timers: [],
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

        if (state.timers) {
            persistedState.timers = state.timers.map(timer => timer.toJson());
        }

        return persistedState;
    }

    protected async restorePersistedState(state: PersistedState): Promise<Partial<State>> {
        return {
            ...state,
            dish: state.dish && await Dish.fromJson(state.dish),
            timers: state.timers.map(json => Timer.fromJson(json)),
        };
    }

    protected lockScreen(): void {
        const typedNavigator = navigator as {
            wakeLock?: { request(type?: 'screen'): Promise<{ release(): Promise<void> }> };
        };

        if (!typedNavigator.wakeLock) {
            return;
        }

        try {
            this.screenLock = typedNavigator.wakeLock.request('screen').catch((error) => {
                Errors.reportDevelopmentError(error, 'Could not request screen wake lock');
            });
        } catch (error) {
            Errors.reportDevelopmentError(error, 'Could not request screen wake lock');
        }
    }

    protected releaseScreen(): void {
        if (!this.screenLock) {
            return;
        }

        this.screenLock.then(lock => lock?.release());
        this.screenLock = null;
    }

    private onTimerUpdated(): void {
        this.setState({ timers: this.timers.slice(0) });
    }

    private onTimerStarted(timer: Timer): void {
        if (this.timeouts.has(timer)) {
            return;
        }

        const timeout = setTimeout(() => {
            UI.openModal(KitchenTimeoutModal, { timer });

            this.timeouts.delete(timer);
            this.onTimerUpdated();
        }, timer.getTimeLeft());

        this.timeouts.set(timer, timeout);
    }

    private onTimerStopped(timer: Timer): void {
        const timeout = this.timeouts.get(timer);

        if (!timeout) {
            return;
        }

        clearTimeout(timeout);
        this.timeouts.delete(timer);
    }

}

export default interface CookbookService extends IService<State, ComputedState> {}
