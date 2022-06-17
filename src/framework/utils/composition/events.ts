import { onUnmounted } from 'vue';

import Events from '@/framework/core/facades/Events';
import type {
    EventListener,
    EventWithPayload,
    EventWithoutPayload,
    EventsPayload,
    UnknownEvent,
} from '@/framework/core/services/EventsService';

/* eslint-disable max-len */
export function useEvent<Event extends EventWithoutPayload>(event: Event, listener: () => unknown): void;
export function useEvent<Event extends EventWithPayload>(event: Event, listener: EventListener<EventsPayload[Event]>): void;
export function useEvent<Event extends string>(event: UnknownEvent<Event>, listener: EventListener): void;
/* eslint-enable max-len */

export function useEvent(event: string, listener: EventListener): void {
    const unsubscribe = Events.on(event, listener);

    onUnmounted(() => unsubscribe());
}
