import { tap } from '@noeldemartin/utils';
import type { Constructor } from '@noeldemartin/utils';

import type Service from '@/framework/core/Service';

interface ServiceInternals {
    _namespace: string;
    _ready: Promise<void>;
    _resolveReady(): void;
    registerStoreModule(): void;
}

export type GetState<T> = T extends Service<infer State> ? State : never;
export type MockServices<T> = {
    [k in keyof T]: T[k] extends Service<GetState<T[k]>> ? MockService<T[k], GetState<T[k]>> : never;
};
export type MockService<T extends Service<State>, State> = {
    -readonly [k in keyof T]: T[k];
} & { setState(state: Partial<State>): void };

export function mockService<T extends Service<S>, S>(
    namespace: string,
    serviceClass: Constructor<T>,
): MockService<T, S> {
    const baseClass = serviceClass as Constructor;
    const mockClass = class extends baseClass {

        public launch(this: ServiceInternals, namespace?: string): Promise<void> {
            this._namespace = namespace ?? this._namespace;

            this.registerStoreModule();
            this._resolveReady();

            return this._ready;
        }
    
    };

    return tap(new mockClass() as MockService<T, S>, service => {
        service.launch(namespace);
    });
}
