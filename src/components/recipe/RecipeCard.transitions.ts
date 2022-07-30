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
    Router.currentRouteIs('recipes.show')
        ? await ElementTransitions.waitElementsReady('recipe-details')
        : await fadeOut(wrapper, 700);
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

export const transitionToDetails = defineElementTransition(async ($wrapper, $card, { element: $details }) => {
    const duration = 500;
    const $cardOverlay = document.createElement('div');
    const $cardTitleWrapper = requireChildElement($card, '.recipe-card--title-wrapper');
    const $cardTitleText = requireChildElement($card, '.recipe-card--title-text');
    const $cardTitleBackground = requireChildElement($card, '.recipe-card--title-background');
    const $detailsWrapper = requireChildElement($details, '.recipe-page--wrapper');
    const $detailsImage = requireChildElement($details, '.recipe-page--image');
    const $detailsHeaderTitle = requireChildElement($details, '.recipe-details--header-title');
    const cardBoundingRect = $card.getBoundingClientRect();
    const detailsImageBoundingRect = $detailsImage.getBoundingClientRect();
    const detailsHeaderTitleBoundingRect = $detailsHeaderTitle.getBoundingClientRect();

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
            boundingRects: [cardBoundingRect, detailsImageBoundingRect],
        },
        {
            element: $cardOverlay,
            before: {
                addClasses: 'absolute z-10 inset-x-0 top-0 bg-gradient-to-b from-dark-overlay to-transparent',
            },
            styles: {
                opacity: [0, 1],
                height: [
                    `${UI.headerHeight * cardBoundingRect.height / detailsImageBoundingRect.height}px`,
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
                    `${detailsHeaderTitleBoundingRect.left}px`,
                ],
                paddingRight: [
                    TailwindCSS.css('spacing.2'),
                    `${window.innerWidth - detailsHeaderTitleBoundingRect.right}px`,
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
            element: $detailsWrapper,
            before: { addClasses: '!z-20' },
            after: { removeClasses: '!z-20' },
        },
    ]);

    await ElementTransitions.waitElementsReady('recipe-details');
});
