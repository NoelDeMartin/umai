import { fail } from '@noeldemartin/utils';

type FacadeMethods<T> = {
    instance: T | null;
    setInstance(instance: T): void;
    requireInstance(): T;
};

type Facade<T> = T & FacadeMethods<T>;

// eslint-disable-next-line @typescript-eslint/ban-types
export function facade<T extends object>(instance: T | null = null): Facade<T> {
    const facade: FacadeMethods<T> = {
        instance,
        setInstance: instance => (facade.instance = instance),
        requireInstance: () => facade.instance ?? fail('Facade not initialized'),
    };

    return new Proxy(facade, {
        get: (_, property, receiver) => {
            const t = property !== 'constructor' && property in facade ? facade : facade.requireInstance();

            return Reflect.get(t, property, receiver);
        },
        set: (_, property, receiver) => Reflect.set(facade.requireInstance(), property, receiver),
    }) as unknown as Facade<T>;
}
