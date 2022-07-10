import { arr, tap } from '@noeldemartin/utils';
import type { FluentArray } from '@noeldemartin/utils';

import Service from '@/framework/core/Service';

export interface EventsPayload {}

export type EventListener<T=unknown> = (payload: T) => unknown;
export type UnknownEvent<T> = T extends keyof EventsPayload ? never : T;

export type EventWithoutPayload = {
    [K in keyof EventsPayload]: EventsPayload[K] extends void ? K : never;
}[keyof EventsPayload];

export type EventWithPayload = {
    [K in keyof EventsPayload]: EventsPayload[K] extends void ? never : K;
}[keyof EventsPayload];

export default class EventsService extends Service {

    private listeners: Record<string, FluentArray<EventListener>> = {};

    public emit<Event extends EventWithoutPayload>(event: Event): Promise<void>;
    public emit<Event extends EventWithPayload>(event: Event, payload: EventsPayload[Event]): Promise<void>;
    public emit<Event extends string>(event: UnknownEvent<Event>, payload?: unknown): Promise<void>;
    public async emit(event: string, payload?: unknown): Promise<void> {
        const listeners = [...this.listeners[event] ?? []];

        await Promise.all(listeners.map(listener => listener(payload)) ?? []);
    }

    /* eslint-disable max-len */
    public on<Event extends EventWithoutPayload>(event: Event, listener: () => unknown): () => void;
    public on<Event extends EventWithPayload>(event: Event, listener: EventListener<EventsPayload[Event]>): () => void | void;
    public on<Event extends string>(event: UnknownEvent<Event>, listener: EventListener): () => void;
    /* eslint-enable max-len */

    public on(event: string, listener: EventListener): () => void {
        (this.listeners[event] ??= arr<EventListener>([])).push(listener);

        return () => this.off(event, listener);
    }

    /* eslint-disable max-len */
    public once<Event extends EventWithoutPayload>(event: Event, listener: () => unknown): () => void;
    public once<Event extends EventWithPayload>(event: Event, listener: EventListener<EventsPayload[Event]>): () => void | void;
    public once<Event extends string>(event: UnknownEvent<Event>, listener: EventListener): () => void;
    /* eslint-enable max-len */

    public once(event: string, listener: EventListener): () => void {
        let onceListener: EventListener | null = null;

        return tap(() => onceListener && this.off(event, onceListener), off => {
            (this.listeners[event] ??= arr<EventListener>([]))
                .push(onceListener = (...args) => {
                    off();

                    return listener(...args);
                });
        });
    }

    public off(event: string, listener: EventListener): void {
        const eventListeners = this.listeners[event];

        if (!eventListeners) {
            return;
        }

        eventListeners.remove(listener);

        if (eventListeners.isEmpty()) {
            delete this.listeners[event];
        }
    }

}
