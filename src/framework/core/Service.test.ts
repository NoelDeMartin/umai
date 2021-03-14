import { createStore } from 'vuex';
import { tt } from '@noeldemartin/utils';
import type { Equals, Expect } from '@noeldemartin/utils';

import Store from '@/framework/core/facades/Store';

import Service from './Service';
import type { ComputedStateDefinitions, IService } from './Service';

describe('Service', () => {

    let instance: StubService;

    beforeAll(async () => {
        instance = new StubService;
        Store.setInstance(createStore({}));

        await instance.launch();
    });

    beforeEach(() => {
        instance.setState(instance.getInitialState());
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
        Expect<Equals<StubService['foo'], string | null>> |
        Expect<Equals<StubService['bar'], number | null>> |
        Expect<Equals<Pick<StubService, 'hasFoo'>, Readonly<{ hasFoo: boolean }>>> |
        true
    >());

});

interface State {
    foo: string | null;
    bar: number | null;
}

interface ComputedState {
    hasFoo: boolean;
}

class StubService extends Service<State, ComputedState> {

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

interface StubService extends IService<State, ComputedState> {}
