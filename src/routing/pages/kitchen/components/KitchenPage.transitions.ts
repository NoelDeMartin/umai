import Router from '@/framework/core/facades/Router';
import { slideDown, slideUp } from '@/framework/utils/transitions';

import { KITCHEN_TRANSITION_DURATION } from '@/routing/pages/kitchen/constants';

export async function showKitchen(element: HTMLElement): Promise<void> {
    if (Router.previousRouteWas(/^kitchen(\.[^.]+)?$/)) {
        return;
    }

    await slideUp(element, KITCHEN_TRANSITION_DURATION);
}

export async function hideKitchen(element: HTMLElement): Promise<void> {
    if (Router.currentRouteIs(/^kitchen(\.[^.]+)?$/)) {
        return;
    }

    await slideDown(element, KITCHEN_TRANSITION_DURATION);
}
