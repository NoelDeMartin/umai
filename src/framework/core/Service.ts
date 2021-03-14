import type { Constructor } from '@noeldemartin/utils';

import Store from '@/framework/core/facades/Store';

export type ServiceState = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
export type DefaultServiceState = {}; // eslint-disable-line @typescript-eslint/ban-types

export type ComputedStateDefinitions<State, ComputedState> = {
    [ComputedProperty in keyof ComputedState]:
        (state: State, computed: ComputedState) => ComputedState[ComputedProperty];
};

export type IService<
    State extends ServiceState,
    ComputedState extends ServiceState = DefaultServiceState
> = State & Readonly<ComputedState>;

export type ServiceConstructor<T extends Service> = Constructor<T> & typeof Service;

export default class Service<
    State extends ServiceState = DefaultServiceState,
    ComputedState extends ServiceState = DefaultServiceState
> {

    public static __constructingPure: boolean = false;
    public static __classProperties: string[];
    private static pureInstances = new WeakMap;

    protected static pureInstance<T extends Service>(this: ServiceConstructor<T>): T {
        if (!this.pureInstances.has(this)) {
            this.__constructingPure = true;
            this.pureInstances.set(this, new this);
            this.__constructingPure = false;
        }

        return this.pureInstances.get(this);
    }

    protected _namespace!: string;

    private _proxy!: this;
    private _ready!: Promise<void>;
    private _resolveReady!: () => void;
    private _rejectReady!: () => void;

    constructor() {
        if (this.static('__constructingPure'))
            return;

        this._namespace = new.target.name;
        this._ready = new Promise((resolve, reject) => {
            this._resolveReady = resolve;
            this._rejectReady = reject;
        });

        this.initialize();

        return this._proxy;
    }

    public get ready(): Promise<void> {
        return this._ready;
    }

    public static(): ServiceConstructor<this>;
    public static<T extends keyof ServiceConstructor<this>>(property: T): ServiceConstructor<this>[T];
    public static<T extends keyof ServiceConstructor<this>>(
        property?: T,
    ): ServiceConstructor<this> | ServiceConstructor<this>[T] {
        const constructor = this.constructor as ServiceConstructor<this>;

        return property
            ? constructor[property] as ServiceConstructor<this>[T]
            : constructor;
    }

    public launch(namespace?: string): Promise<void> {
        this._namespace = namespace ?? this._namespace;

        this.boot().then(this._resolveReady).catch(this._rejectReady);

        return this._ready;
    }

    protected initialize(): void {
        if (!this.static('__classProperties')) {
            const instance = this.static().pureInstance();

            this.static().__classProperties = Object.getOwnPropertyNames(instance);
        }

        const isReservedProperty = (target: this, property: string | number | symbol): property is number | symbol =>
            typeof property !== 'string' ||
            property in target ||
            target.static('__classProperties').includes(property);

        this._proxy = new Proxy(this, {
            get: (target, property, receiver) =>
                isReservedProperty(target, property)
                    ? Reflect.get(target, property, receiver)
                    : (target.getState()[property] ?? target.getComputedState(property)),
            set(target, property, value, receiver) {
                if (isReservedProperty(target, property))
                    return Reflect.set(target, property, value, receiver);

                target.setState({ [property]: value } as Partial<State>);

                return true;
            },
        });
    }

    protected getState(): State {
        const appState = Store.state as Record<string, State>;

        return appState[this._namespace] ?? this.getInitialState();
    }

    protected setState(state: Partial<State>): void {
        Store.commit(`${this._namespace}/setState`, state);
    }

    protected getComputedState<P extends keyof ComputedState>(property: P): ComputedState[P] {
        return Store.getters[`${this._namespace}/${property}`];
    }

    protected getInitialState(): State {
        return {} as State;
    }

    protected getComputedStateDefinitions(): ComputedStateDefinitions<State, ComputedState> {
        return {} as ComputedStateDefinitions<State, ComputedState>;
    }

    protected async boot(): Promise<void> {
        this.registerStoreModule();
    }

    protected registerStoreModule(): void {
        const initialState = this.getInitialState();

        if (Object.keys(initialState).length === 0)
            return;

        Store.registerModule(this._namespace, {
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
