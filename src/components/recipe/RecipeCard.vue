<template>
    <li
        v-element-transitions="{
            name: 'recipe-card',
            id: recipe.url,
            transitions: {
                'enter': enterTransition,
                'leave': leaveTransition,
                'recipe-card': transitionToCard,
                'recipe-details': transitionToDetails,
            }
        }"
        :data-recipe-url="recipe.url"
        :class="[
            'flex overflow-hidden relative flex-col justify-end rounded-lg shadow aspect-[5/2]',
            'hover:opacity-75',
            visibleFocus && 'ring-2 ring-offset-2 ring-primary-500',
        ]"
    >
        <RecipeImage :url="recipe.imageUrl" class="absolute inset-0" />
        <h2 class="z-10 text-lg font-bold text-white">
            <router-link
                v-focus-visible="setVisibleFocus"
                class="block w-full h-clickable focus-visible:outline-none"
                :to="{ name: 'recipes.show', params: { recipe: recipe.uuid } }"
            >
                <span aria-hidden="true" class="absolute inset-0" />
                <div v-if="recipe.name" class="absolute inset-x-0 bottom-0 p-2 recipe-card--title-wrapper">
                    <div class="absolute inset-0 bg-gradient-to-t to-transparent from-dark-overlay recipe-card--title-background" />
                    <span class="relative recipe-card--title-text">{{ recipe.name }}</span>
                </div>
            </router-link>
        </h2>
    </li>
</template>

<script setup lang="ts">
import ElementTransitions from '@/framework/core/facades/ElementTransitions';
import Router from '@/framework/core/facades/Router';
import TailwindCSS from '@/framework/utils/tailwindcss';
import UI from '@/framework/core/facades/UI';
import {
    defineElementTransition,
    defineEnterTransition,
    defineLeaveTransition,
} from '@/framework/core/services/ElementTransitionsService';
import { animateElement, animateElements, requireChildElement } from '@/framework/utils/dom';
import { fadeIn, fadeOut } from '@/framework/utils/transitions';
import { requiredObjectProp } from '@/framework/utils/vue';

import type Recipe from '@/models/Recipe';

defineProps({
    recipe: requiredObjectProp<Recipe>(),
});

let visibleFocus = $ref(false);

function setVisibleFocus(value: boolean) {
    visibleFocus = value;
}

const enterTransition = defineEnterTransition(async (card, existed) => {
    if (existed || Router.previousRouteWas('recipes.show')) return;

    await fadeIn(card);
});

const leaveTransition = defineLeaveTransition(async wrapper => {
    Router.currentRouteIs('recipes.show')
        ? await ElementTransitions.waitElementsReady('recipe-details')
        : await fadeOut(wrapper);
});

const transitionToCard = defineElementTransition(async ($wrapper, $card, { element: $nextCard }) => {
    const duration = 700;
    const boundingRect = $card.getBoundingClientRect();
    const nextBoundingRect = $nextCard.getBoundingClientRect();

    await animateElement($wrapper, {
        duration,
        boundingRects: [boundingRect, nextBoundingRect],
    });
});

const transitionToDetails = defineElementTransition(async ($wrapper, $card, { element: $details }) => {
    const duration = 500;
    const $cardOverlay = document.createElement('div');
    const $cardTitleWrapper = requireChildElement($card, '.recipe-card--title-wrapper');
    const $cardTitleText = requireChildElement($card, '.recipe-card--title-text');
    const $cardTitleBackground = requireChildElement($card, '.recipe-card--title-background');
    const $detailsHeader = requireChildElement($details, '.recipe-page--header');
    const $detailsHeaderTitle = requireChildElement($details, '.recipe-details--header-title');
    const cardBoundingRect = $card.getBoundingClientRect();
    const detailsHeaderBoundingRect = $detailsHeader.getBoundingClientRect();
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
            before: { addClasses: 'z-20' },
            boundingRects: [cardBoundingRect, detailsHeaderBoundingRect],
        },
        {
            element: $cardOverlay,
            before: {
                addClasses: 'absolute z-10 inset-x-0 top-0 bg-gradient-to-b from-dark-overlay to-transparent',
            },
            styles: {
                opacity: [0, 1],
                height: [
                    `${UI.headerHeight * cardBoundingRect.height / detailsHeaderBoundingRect.height}px`,
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
                height: [
                    `${$cardTitleWrapper.clientHeight}px`,
                    (TailwindCSS.pixels('fontSizes.4xl') + 2 * TailwindCSS.pixels('spacing.4')) + 'px',
                ],
                paddingLeft: [
                    TailwindCSS.css('spacing.2'),
                    `${detailsHeaderTitleBoundingRect.left}px`,
                ],
            },
        },
        {
            element: $cardTitleText,
            before: { addClasses: 'font-semibold' },
            classes: {
                textShadow: ['text-shadow-transparent', 'text-shadow'],
                fontSize: ['text-lg', 'text-4xl'],
            },
        },
        { element: $cardTitleBackground, styles: { opacity: [1, 0] } },
    ]);

    await ElementTransitions.waitElementsReady('recipe-details');
});
</script>
