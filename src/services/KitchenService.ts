import App from '@/framework/core/facades/App';
import Router from '@/framework/core/facades/Router';
import Service from '@/framework/core/Service';
import type { ComputedStateDefinitions, IService } from '@/framework/core/Service';

import Viewer from '@/services/facades/Viewer';

interface State {
    dismissed: boolean;
}

interface ComputedState {
    show: boolean;
}

export default class CookbookService extends Service<State, ComputedState> {

    public dismiss(): void {
        this.dismissed = true;
    }

    protected async boot(): Promise<void> {
        await super.boot();
        await Viewer.booted;
    }

    protected getInitialState(): State {
        return {
            dismissed: false,
        };
    }

    protected getComputedStateDefinitions(): ComputedStateDefinitions<State, ComputedState> {
        return {
            show: ({ dismissed }) =>
                !dismissed &&
                App.isMounted &&
                !Viewer.active &&
                Router.currentRouteIs(/^kitchen\.[^.]+|recipes\.show$/),
        };
    }

}

export default interface CookbookService extends IService<State, ComputedState> {}
