import { defineElementTransition, defineEnterTransition } from '@/framework/core/services/ElementTransitionsService';
import { requireChildElement } from '@/framework/utils/dom';

import { bodySlideDown, bodySlideUp, headerDelay, headerToCard } from '@/components/recipe/RecipePage.transitions';

const enterTransitions: Record<string, ($root: HTMLElement, duration: number) => Promise<unknown>> = {
    'recipe-card': ($root, duration) => Promise.all([
        headerDelay($root, duration),
        bodySlideUp($root, duration),
    ]),
};

export const enterTransition = defineEnterTransition(async ($root, previous) => {
    const duration = 500;
    const previousElement = previous?.config.name ?? '';
    const enterTransition = enterTransitions[previousElement];

    if (!enterTransition) {
        return;
    }

    await enterTransition($root, duration);
});

export const transitionToCard = defineElementTransition(async ($wrapper, $root, { element: $card }) => {
    const duration = 500;
    const $headerTitle = requireChildElement($root, '.viewer-recipe--header-title');
    const $headerTitleText = requireChildElement($root, '.viewer-recipe--header-title-text');

    $wrapper.classList.add('z-20');

    await Promise.all([
        headerToCard($root, { duration, $headerTitle, $headerTitleText, $card }),
        bodySlideDown($root, duration),
    ]);
});
