import { arrayRemove } from '@noeldemartin/utils';
import type { Closure } from '@noeldemartin/utils';

export type ListenerEvents<TListener> = {
    [K in keyof TListener]: Required<TListener>[K] extends Closure ? K : never;
}[keyof TListener];

export type GetEventArgs<TListener, TEvent extends keyof TListener> =
    Required<TListener>[TEvent] extends Closure<infer Args> ? Args : never;

export interface Listeners<Listener> {
    add(listener: Listener): () => void;
    remove(listener: Listener): void;
}

export default class ListenersManager<Listener> implements Listeners<Listener> {

    private listeners: Listener[] = [];

    public add(listener: Listener): () => void {
        this.listeners.push(listener);

        return () => this.remove(listener);
    }

    public remove(listener: Listener): void {
        arrayRemove(this.listeners, listener);
    }

    public emit<T extends ListenerEvents<Listener>>(event: T, ...args: GetEventArgs<Listener, T>): void {
        for (const listener of this.listeners) {
            if (typeof listener[event] !== 'function') {
                continue;
            }

            (listener[event] as unknown as Closure)(...args);
        }
    }

}
