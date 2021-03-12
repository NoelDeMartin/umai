import type { Store } from 'vuex';

import Services from '@/framework/services/Services';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ServiceState = Record<string, any>;

// eslint-disable-next-line @typescript-eslint/ban-types
export type DefaultServiceState = {};

export type ComputedStateDefinitions<State, ComputedState> = {
    [ComputedProperty in keyof ComputedState]:
        (state: State, computed: ComputedState) => ComputedState[ComputedProperty];
};

export type IService<
    State extends ServiceState,
    ComputedState extends ServiceState = DefaultServiceState
> = State & ComputedState;

export default abstract class Service<
    State extends ServiceState = DefaultServiceState,
    ComputedState extends ServiceState = DefaultServiceState
> {

    protected _namespace: string;

    private _proxy!: this;
    private _ready: Promise<void>;
    private _resolveReady!: () => void;
    private _rejectReady!: () => void;

    constructor() {
        this._namespace = new.target.name;
        this._ready = new Promise((resolve, reject) => {
            this._resolveReady = resolve;
            this._rejectReady = reject;
        });

        this.initialize();

        return this._proxy;
    }

    public launch(namespace?: string): Promise<void> {
        this._namespace = namespace ?? this._namespace;

        this.boot().then(this._resolveReady).catch(this._rejectReady);

        return this._ready;
    }

    protected initialize(): void {
        this._proxy = new Proxy(this, {
            get(target, property, receiver) {
                if (typeof property !== 'string' || property in target)
                    return Reflect.get(target, property, receiver);

                return target.getState()[property] ?? target.getComputedState(property);
            },
            set(target, property, value, receiver) {
                if (typeof property !== 'string' || property in target)
                    return Reflect.set(target, property, value, receiver);

                target.setState({ [property]: value } as Partial<State>);

                return true;
            },
        });
    }

    protected getState(): State {
        const appState = Services.$store.state as Record<string, State>;

        return appState[this._namespace] ?? this.getInitialState();
    }

    protected setState(state: Partial<State>): void {
        Services.$store.commit(`${this._namespace}/setState`, state);
    }

    protected getComputedState<P extends keyof ComputedState>(property: P): ComputedState[P] {
        return Services.$store.getters[`${this._namespace}/${property}`];
    }

    protected getInitialState(): State {
        return {} as State;
    }

    protected getComputedStateDefinitions(): ComputedStateDefinitions<State, ComputedState> {
        return {} as ComputedStateDefinitions<State, ComputedState>;
    }

    protected async boot(): Promise<void> {
        this.registerStoreModule(Services.$store as Store<State>);
    }

    protected registerStoreModule(store: Store<State>): void {
        const initialState = this.getInitialState();

        if (Object.keys(initialState).length === 0)
            return;

        store.registerModule(this._namespace, {
            namespaced: true,
            state: initialState,
            mutations: {
                setState: (state: State, newState: Partial<State>) => {
                    Object.assign(state, newState);
                },
            },
            getters: this.getComputedStateDefinitions(),
        });
    }

}
