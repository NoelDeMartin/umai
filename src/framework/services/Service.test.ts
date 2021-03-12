import { createStore } from 'vuex';
import { tt } from '@noeldemartin/utils';
import type { Equals, Expect } from '@noeldemartin/utils';

import Services from '@/framework/services/Services';

import Service from './Service';
import type { ComputedStateDefinitions, IService } from './Service';

interface State {
    foo: string | null;
    bar: number | null;
}

interface ComputedState {
    hasFoo: boolean;
}

class Stub extends Service<State, ComputedState> {

    public getState(): State {
        return super.getState();
    }

    public setState(state: Partial<State>): void {
        super.setState(state);
    }

    public getInitialState(): State {
        return {
            foo: null,
            bar: null,
        };
    }

    protected getComputedStateDefinitions(): ComputedStateDefinitions<State, ComputedState> {
        return {
            hasFoo: state => state.foo !== null,
        };
    }

}

interface Stub extends IService<State, ComputedState> {}

describe('Service', () => {

    let instance: Stub;

    beforeEach(async () => {
        instance = new Stub;
        Services.$store = createStore({});

        await instance.launch();
    });

    it('has magic state getters', () => {
        instance.setState({ foo: 'bar' });

        expect(instance.foo).toEqual('bar');
    });

    it('has magic state setters', () => {
        instance.bar = 42;

        expect(instance.getState().bar).toEqual(42);
    });

    it('has magic computed state getters', () => {
        expect(instance.hasFoo).toBe(false);

        instance.setState({ foo: 'bar' });

        expect(instance.hasFoo).toBe(true);
    });

});

describe('Service types', () => {

    it('has correct types', tt<
        Expect<Equals<Stub['foo'], string | null>> |
        Expect<Equals<Stub['bar'], number | null>> |
        Expect<Equals<Stub['hasFoo'], boolean>> |
        true
    >());

});
