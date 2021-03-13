import { arr } from '@noeldemartin/utils';
import type { FluentArray } from '@noeldemartin/utils';

import Service from '@/framework/services/Service';

export type EventListener = (payload?: unknown) => void | Promise<void>;

export class Events extends Service {

    private listeners: Record<string, FluentArray<EventListener>> = {};

    public async emit(event: string, payload?: unknown): Promise<void> {
        if (!(event in this.listeners))
            return;

        const eventListeners = this.listeners[event];

        await Promise.all(eventListeners.map(listener => listener(payload)));
    }

    public on(event: string, listener: EventListener): () => void {
        if (!(event in this.listeners))
            this.listeners[event] = arr<EventListener>([]);

        this.listeners[event].push(listener);

        return () => this.off(event, listener);
    }

    public off(event: string, listener: EventListener): void {
        if (!(event in this.listeners))
            return;

        this.listeners[event].remove(listener);

        if (this.listeners[event].isEmpty())
            delete this.listeners[event];
    }

}
