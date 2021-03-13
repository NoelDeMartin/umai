import { Storage } from '@noeldemartin/utils';

import Service from '@/framework/services/Service';
import Services from '@/framework/services/Services';
import type { ComputedStateDefinitions , IService } from '@/framework/services/Service';

interface User {
    name: string;
}

interface State {
    user: User | null;
}

interface ComputedState {
    loggedIn: boolean;
}

export class Auth extends Service<State, ComputedState> {

    public isLoggedIn(): this is { user: User } {
        return this.loggedIn;
    }

    public async login(): Promise<void> {
        this.user = { name: 'John Doe' };

        Storage.set('user', this.user);

        await Services.$events.emit('login', this.user);
    }

    public async logout(): Promise<void> {
        this.user = null;

        Storage.remove('user');

        await Services.$events.emit('logout');
    }

    protected async boot(): Promise<void> {
        await super.boot();

        if (Storage.has('user'))
            this.user = Storage.get('user');
    }

    protected getInitialState(): State {
        return {
            user: null,
        };
    }

    protected getComputedStateDefinitions(): ComputedStateDefinitions<State, ComputedState> {
        return {
            loggedIn: state => state.user !== null,
        };
    }

}

export interface Auth extends IService<State, ComputedState> {}
