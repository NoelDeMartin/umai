import { Storage } from '@noeldemartin/utils';

import Service from '@/framework/services/Service';
import type { ComputedStateDefinitions , IService } from '@/framework/services/Service';

import Recipe from '@/models/Recipe';

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
    }

    public async logout(): Promise<void> {
        this.user = null;

        Storage.remove('user');

        const recipes = await Recipe.all();

        await Promise.all(recipes.map(recipe => recipe.delete()));
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
