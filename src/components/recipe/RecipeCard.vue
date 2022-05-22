<template>
    <li
        v-element-transitions="{
            name: 'recipe-card',
            id: recipe.url,
            transitions: {
                enter: enterTransition,
                leave: leaveTransition,
                'recipe-card': transitionToCard,
                'recipe-details': transitionToDetails,
            },
        }"
        :data-recipe-url="recipe.url"
        :class="[
            'relative flex aspect-[5/2] flex-col justify-end overflow-hidden rounded-lg shadow',
            'hover:opacity-75',
            visibleFocus && 'ring-2 ring-primary-500 ring-offset-2',
        ]"
    >
        <RecipeImage :url="recipe.imageUrl" class="absolute inset-0" />
        <h2 class="z-10 text-lg font-bold text-white">
            <router-link
                v-focus-visible="setVisibleFocus"
                class="block h-clickable w-full focus-visible:outline-none"
                :to="{ name: 'recipes.show', params: { recipe: recipe.uuid } }"
            >
                <span aria-hidden="true" class="absolute inset-0" />
                <div
                    v-if="recipe.name"
                    class="recipe-card--title-wrapper absolute inset-x-0 bottom-0 p-2"
                >
                    <div
                        class="recipe-card--title-background absolute inset-0 bg-gradient-to-t from-dark-overlay to-transparent"
                    />
                    <span class="recipe-card--title-text relative">{{
                        recipe.name
                    }}</span>
                </div>
            </router-link>
        </h2>
    </li>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';

import ElementTransitions from '@/framework/core/facades/ElementTransitions';
import Router from '@/framework/core/facades/Router';
import TailwindCSS from '@/framework/utils/tailwindcss';
import UI from '@/framework/core/facades/UI';
import {
    defineElementTransition,
    defineEnterTransition,
    defineLeaveTransition,
} from '@/framework/core/services/ElementTransitionsService';
import { animateElement, animateElements } from '@/framework/utils/dom';
import { fadeIn, fadeOut } from '@/framework/utils/transitions';

import type Recipe from '@/models/Recipe';

defineProps({
    recipe: {
        type: Object as PropType<Recipe>,
        required: true,
    },
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

const transitionToCard = defineElementTransition(async (wrapper, el, next) => {
    const duration = 700;
    const boundingRect = el.getBoundingClientRect();
    const nextBoundingRect = next.getBoundingClientRect();

    await animateElement(wrapper, {
        duration,
        boundingRects: [boundingRect, nextBoundingRect],
    });
});

const transitionToDetails = defineElementTransition(
    async (wrapper, card, details) => {
        const duration = 500;
        const cardBoundingRect = card.getBoundingClientRect();
        const cardOverlay = document.createElement('div');
        const cardTitleWrapper = card.querySelector(
            '.recipe-card--title-wrapper',
        ) as HTMLElement;
        const cardTitleText = card.querySelector(
            '.recipe-card--title-text',
        ) as HTMLElement;
        const cardTitleBackground = card.querySelector(
            '.recipe-card--title-background',
        ) as HTMLElement;
        const detailsHeader = details.querySelector(
            '.recipe-details--header',
        ) as HTMLElement;
        const detailsHeaderBoundingRect = detailsHeader.getBoundingClientRect();
        const detailsHeaderTitle = details.querySelector(
            '.recipe-details--header-title',
        ) as HTMLElement;
        const detailsHeaderTitleBoundingRect =
            detailsHeaderTitle.getBoundingClientRect();

        await animateElements({ duration, fill: 'forwards' }, [
            {
                element: card,
                before: {
                    addClasses: 'w-full h-full',
                    removeClasses: 'aspect-[5/2] hover:opacity-75 rounded-lg',
                    prepend: cardOverlay,
                },
                classes: { borderRadius: ['rounded-lg', 'rounded-none'] },
            },
            {
                element: wrapper,
                before: { addClasses: 'z-20' },
                boundingRects: [cardBoundingRect, detailsHeaderBoundingRect],
            },
            {
                element: cardOverlay,
                before: {
                    addClasses:
                        'absolute z-10 inset-x-0 top-0 bg-gradient-to-b from-dark-overlay to-transparent',
                },
                styles: {
                    opacity: [0, 1],
                    height: [
                        `${
                            (UI.headerHeight * cardBoundingRect.height) /
                            detailsHeaderBoundingRect.height
                        }px`,
                        `${UI.headerHeight}px`,
                    ],
                },
            },
            {
                element: cardTitleWrapper,
                before: { removeClasses: 'p-2' },
                classes: {
                    paddingTop: ['p-2', 'p-4'],
                    paddingRight: ['p-2', 'p-4'],
                    paddingBottom: ['p-2', 'p-4'],
                },
                styles: {
                    height: [
                        `${cardTitleWrapper.clientHeight}px`,
                        TailwindCSS.pixels('fontSizes.4xl') +
                            2 * TailwindCSS.pixels('spacing.4') +
                            'px',
                    ],
                    paddingLeft: [
                        TailwindCSS.css('spacing.2'),
                        `${detailsHeaderTitleBoundingRect.left}px`,
                    ],
                },
            },
            {
                element: cardTitleText,
                before: { addClasses: 'font-semibold' },
                classes: {
                    textShadow: ['text-shadow-transparent', 'text-shadow'],
                    fontSize: ['text-lg', 'text-4xl'],
                },
            },
            { element: cardTitleBackground, styles: { opacity: [1, 0] } },
        ]);

        await ElementTransitions.waitElementsReady('recipe-details');
    },
);
</script>
