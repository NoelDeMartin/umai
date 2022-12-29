import ElementTransitions from '@/framework/core/facades/ElementTransitions';
import Router from '@/framework/core/facades/Router';
import TailwindCSS from '@/framework/utils/tailwindcss';
import UI from '@/framework/core/facades/UI';
import { animateElement, animateElements, requireChildElement } from '@/framework/utils/dom';
import { delayUntil, fadeIn, fadeOut } from '@/framework/utils/transitions';
import {
    defineElementTransition,
    defineEnterTransition,
    defineLeaveTransition,
} from '@/framework/core/services/ElementTransitionsService';

import Viewer from '@/services/facades/Viewer';

async function transitionToRecipePage(
    $wrapper: HTMLElement,
    $card: HTMLElement,
    $page: HTMLElement,
    $pageHeaderTitle: HTMLElement,
): Promise<void> {
    const duration = 500;
    const $cardOverlay = document.createElement('div');
    const $cardTitleWrapper = requireChildElement($card, '.recipe-card--title-wrapper');
    const $cardTitleText = requireChildElement($card, '.recipe-card--title-text');
    const $cardTitleBackground = requireChildElement($card, '.recipe-card--title-background');
    const $pageWrapper = requireChildElement($page, '.recipe-page--wrapper');
    const $pageImage = requireChildElement($page, '.recipe-page--image');
    const cardBoundingRect = $card.getBoundingClientRect();
    const pageImageBoundingRect = $pageImage.getBoundingClientRect();
    const pageHeaderTitleBoundingRect = $pageHeaderTitle.getBoundingClientRect();

    await animateElements({ duration, fill: 'forwards' }, [
        {
            element: $card,
            before: {
                addClasses: 'w-full h-full',
                removeClasses: 'aspect-[5/2] hover:opacity-75 rounded-lg',
                prepend: $cardOverlay,
            },
            classes: { borderRadius: ['rounded-lg', 'rounded-none'] },
        },
        {
            element: $wrapper,
            before: { addClasses: 'z-10' },
            boundingRects: [cardBoundingRect, pageImageBoundingRect],
        },
        {
            element: $cardOverlay,
            before: {
                addClasses: 'absolute z-10 inset-x-0 top-0 bg-gradient-to-b from-dark-overlay to-transparent',
            },
            styles: {
                opacity: [0, 1],
                height: [
                    `${UI.headerHeight * cardBoundingRect.height / pageImageBoundingRect.height}px`,
                    `${UI.headerHeight}px`,
                ],
            },
        },
        {
            element: $cardTitleWrapper,
            before: { removeClasses: 'p-2' },
            classes: {
                paddingTop: ['p-2', 'p-4'],
                paddingRight: ['p-2', 'p-4'],
                paddingBottom: ['p-2', 'p-4'],
            },
            styles: {
                paddingLeft: [
                    TailwindCSS.css('spacing.2'),
                    `${pageHeaderTitleBoundingRect.left}px`,
                ],
                paddingRight: [
                    TailwindCSS.css('spacing.2'),
                    `${window.innerWidth - pageHeaderTitleBoundingRect.right}px`,
                ],
            },
        },
        {
            element: $cardTitleText,
            before: { addClasses: 'font-semibold' },
            classes: {
                textShadow: ['text-shadow-transparent', 'text-shadow'],
                fontSize: ['text-lg', UI.isMobile ? 'text-2xl' : 'text-4xl'],
            },
        },
        { element: $cardTitleBackground, styles: { opacity: [1, 0] } },
        {
            element: $pageWrapper,
            before: { addClasses: '!z-20' },
            after: { removeClasses: '!z-20' },
        },
    ]);
}

export const enterTransition = defineEnterTransition(async ($card, previous) => {
    if (previous?.config.name) {
        await delayUntil($card, ElementTransitions.waitElementsGone(previous.config.name, previous.config.id));

        return;
    }

    if (Router.previousRouteWas('recipes.show')) {
        return;
    }

    await fadeIn($card, 700);
});

export const leaveTransition = defineLeaveTransition(async wrapper => {
    if (Router.currentRouteIs('recipes.show')) {
        await ElementTransitions.waitElementsReady('recipe-details');

        return;
    }

    if (Viewer.active) {
        await ElementTransitions.waitElementsReady('viewer-recipe');

        return;
    }

    await fadeOut(wrapper, 700);
});

export const transitionToCard = defineElementTransition(async ($wrapper, $card, { element: $nextCard }) => {
    const duration = 700;
    const boundingRect = $card.getBoundingClientRect();
    const nextBoundingRect = $nextCard.getBoundingClientRect();

    await animateElement($wrapper, {
        duration,
        boundingRects: [boundingRect, nextBoundingRect],
    });
});


export const transitionToViewer = defineElementTransition(async ($wrapper, $card, { element: $viewer }) => {
    const $detailsHeaderTitle = requireChildElement($viewer, '.viewer-recipe--header-title');

    await transitionToRecipePage($wrapper, $card, $viewer, $detailsHeaderTitle);
    await ElementTransitions.waitElementsReady('viewer-recipe');
});

export const transitionToDetails = defineElementTransition(async ($wrapper, $card, { element: $details }) => {
    const $detailsHeaderTitle = requireChildElement($details, '.recipe-details--header-title');

    await transitionToRecipePage($wrapper, $card, $details, $detailsHeaderTitle);
    await ElementTransitions.waitElementsReady('recipe-details');
});
