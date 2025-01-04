import Router from '@/framework/core/facades/Router';
import UI from '@/framework/core/facades/UI';
import { slideDown, slideUp } from '@/framework/utils/transitions';

import Kitchen from '@/services/facades/Kitchen';
import { KITCHEN_TRANSITION_DURATION } from '@/routing/pages/kitchen/constants';

export async function showKitchen(element: HTMLElement): Promise<void> {
    if (Router.previousRouteWas(/^kitchen(\.[^.]+)?$/)) {
        return;
    }

    await slideUp(element, KITCHEN_TRANSITION_DURATION);

    UI.hideHeader();
}

export async function hideKitchen(element: HTMLElement): Promise<void> {
    if (Kitchen.active) {
        return;
    }

    UI.restoreHeader();

    await slideDown(element, KITCHEN_TRANSITION_DURATION);
}
