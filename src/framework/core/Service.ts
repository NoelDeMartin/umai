import { PromisedValue, Storage, isEmpty, objectDeepClone, objectOnly } from '@noeldemartin/utils';
import type { Constructor } from '@noeldemartin/utils';

import ServiceBootError from '@/framework/core/errors/ServiceBootError';
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
    ComputedState extends ServiceState = DefaultServiceState,
    PersistedState extends {} = Partial<State>
> {

    public static persist: string[] = [];
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
    private _booted!: PromisedValue<void>;

    constructor() {
        if (this.static('__constructingPure'))
            return;

        this._namespace = new.target.name;
        this._booted = new PromisedValue();

        this.initialize();

        return this._proxy;
    }

    public get booted(): PromisedValue<void> {
        return this._booted;
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
        const handleError = (error: unknown) => this._booted.reject(new ServiceBootError(this._namespace, error));

        this._namespace = namespace ?? this._namespace;

        try {
            this.boot().then(() => this._booted.resolve()).catch(handleError);
        } catch (error) {
            handleError(error);
        }

        return this._booted;
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

        const proxy: this = this._proxy = new Proxy(this, {
            get: (target, property, receiver) => {
                if (isReservedProperty(target, property))
                    return Reflect.get(target, property, receiver);

                if (proxy.hasState(property))
                    return proxy.getState(property);

                if (proxy.hasComputedState(property))
                    return proxy.getComputedState(property);

                return proxy.__get(property);
            },
            set(target, property, value, receiver) {
                if (isReservedProperty(target, property))
                    return Reflect.set(target, property, value, receiver);

                proxy.setState({ [property]: value } as Partial<State>);

                return true;
            },
        });
    }

    protected hasState<P extends keyof State>(property: P): boolean {
        const appState = Store.state as Record<string, State>;
        const serviceState = appState[this._namespace] ?? this.getInitialState();

        return property in serviceState;
    }

    protected getState(): State;
    protected getState<P extends keyof State>(property: P): State[P];
    protected getState<P extends keyof State>(property?: P): State | State[P] {
        const appState = Store.state as Record<string, State>;
        const serviceState = appState[this._namespace] ?? this.getInitialState();

        return property ? serviceState[property] : serviceState;
    }

    protected setState(state: Partial<State>): void {
        Store.commit(`${this._namespace}/setState`, state);

        this.onStateUpdated(state);
    }

    protected onStateUpdated(state: Partial<State>): void {
        const persisted = objectOnly(state, this.static('persist')) as Partial<State>;

        if (isEmpty(persisted)) {
            return;
        }

        Storage.set(this._namespace, {
            ...Storage.require<PersistedState>(this._namespace),
            ...this.serializePersistedState(objectDeepClone(persisted)),
        });
    }

    protected hasComputedState(property: keyof ComputedState): boolean {
        return `${this._namespace}/${property as string}` in Store.getters;
    }

    protected getComputedState<P extends keyof ComputedState>(property: P): ComputedState[P] {
        return Store.getters[`${this._namespace}/${property as string}`];
    }

    protected getInitialState(): State {
        return {} as State;
    }

    protected getComputedStateDefinitions(): ComputedStateDefinitions<State, ComputedState> {
        return {} as ComputedStateDefinitions<State, ComputedState>;
    }

    protected serializePersistedState(state: Partial<State>): Partial<PersistedState> {
        return state as PersistedState;
    }

    protected async restorePersistedState(state: PersistedState): Promise<Partial<State>> {
        return state;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected __get(property: string | number | symbol): unknown {
        return undefined;
    }

    protected async boot(): Promise<void> {
        this.registerStoreModule();

        if (isEmpty(this.static('persist')))
            return;

        if (Storage.has(this._namespace)) {
            const persisted = await this.restorePersistedState(Storage.require<PersistedState>(this._namespace));

            this.setState(persisted);

            return;
        }

        const persisted = objectOnly(objectDeepClone(this.getState()), this.static('persist')) as Partial<State>;

        Storage.set(this._namespace, this.serializePersistedState(persisted));
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
