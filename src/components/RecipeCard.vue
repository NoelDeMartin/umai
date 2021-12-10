<template>
    <li
        v-element-transitions="{
            name: 'recipe-card',
            id: recipe.url,
            transitions: {
                'enter': enterTransition,
                'recipe-card': transitionToCard,
                'recipe-details': transitionToDetails,
                'leave': $elementTransitions.fadeOut,
            }
        }"
        :data-recipe-url="recipe.url"
        :class="[
            'flex overflow-hidden relative flex-col justify-end rounded-lg shadow aspect-[5/2]',
            'hover:opacity-75',
            visibleFocus && 'ring-2 ring-offset-2 ring-primary-500',
        ]"
    >
        <RecipeImage :recipe="recipe" class="absolute inset-0" />
        <h2 class="z-10 text-lg font-bold text-white">
            <router-link
                v-focus-visible="setVisibleFocus"
                class="focus-visible:outline-none"
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
import { after } from '@noeldemartin/utils';
import { ref } from 'vue';
import type { PropType } from 'vue';

import Router from '@/framework/core/facades/Router';
import TailwindCSS from '@/framework/utils/tailwindcss';
import UI from '@/framework/core/facades/UI';
import { afterElementsUpdated, updateElement } from '@/framework/utils/dom';
import { defineElementTransition, defineEnterTransition } from '@/framework/core/services/ElementTransitionsService';
import { fadeIn } from '@/framework/utils/transitions';

import type Recipe from '@/models/Recipe';

defineProps({
    recipe: {
        type: Object as PropType<Recipe>,
        required: true,
    },
});

const visibleFocus = ref(false);

function setVisibleFocus(value: boolean) {
    visibleFocus.value = value;
}

const enterTransition = defineEnterTransition(async (card, existed) => {
    if (existed || Router.previousRouteWas('recipes.show')) return;

    await fadeIn(card);
});

const transitionToCard = defineElementTransition(async (wrapper, _, next) => {
    const duration = 700;
    const nextBoundingRect = next.getBoundingClientRect();

    updateElement(wrapper, {
        transition: duration,
        boundingRect: nextBoundingRect,
    });

    await after({ milliseconds: duration });
});

const transitionToDetails = defineElementTransition(async (wrapper, card, details) => {
    const duration = 600;
    const cardBoundingRect = card.getBoundingClientRect();
    const cardOverlay = document.createElement('div');
    const cardTitleWrapper = card.querySelector('.recipe-card--title-wrapper') as HTMLElement;
    const cardTitleBackground = card.querySelector('.recipe-card--title-background') as HTMLElement;
    const cardTitleText = card.querySelector('.recipe-card--title-text') as HTMLElement;
    const detailsHeader = details.querySelector('.recipe-details--header') as HTMLElement;
    const detailsHeaderBoundingRect = detailsHeader.getBoundingClientRect();

    // Prepare elements
    updateElement(wrapper, { addClasses: 'z-10' });
    updateElement(card, {
        addClasses: 'w-full h-full',
        removeClasses: 'aspect-[5/2] hover:opacity-75',
        prepend: cardOverlay,
    });
    updateElement(cardTitleWrapper, {
        styles: { height: `${cardTitleWrapper.clientHeight}px` },
    });
    updateElement(cardTitleText, { addClasses: 'text-shadow-transparent' });
    updateElement(cardOverlay, {
        addClasses: 'absolute z-10 inset-x-0 top-0 bg-gradient-to-b from-dark-overlay to-transparent opacity-0',
        styles: { height: `${UI.headerHeight * cardBoundingRect.height / detailsHeaderBoundingRect.height}px` },
    });

    await afterElementsUpdated();

    // Transition
    updateElement(wrapper, {
        transition: duration,
        boundingRect: detailsHeaderBoundingRect,
    });
    updateElement(card, {
        transition: duration,
        removeClasses: 'rounded-lg',
    });
    updateElement(cardOverlay, {
        transition: duration,
        addClasses: 'opacity-100',
        removeClasses: 'opacity-0',
        styles: { height: `${UI.headerHeight}px` },
    });
    updateElement(cardTitleWrapper, {
        transition: duration,
        removeClasses: 'p-2',
        styles: {
            height: (TailwindCSS.pixels('fontSizes.4xl') + 2 * TailwindCSS.pixels('spacing.4')) + 'px',
            padding: [
                TailwindCSS.css('spacing.4'),
                TailwindCSS.css('spacing.4'),
                TailwindCSS.css('spacing.4'),
                Math.max(
                    TailwindCSS.pixels('spacing.edge'),
                    (detailsHeaderBoundingRect.width - TailwindCSS.pixels('spacing.content')) / 2,
                ) + 'px',
            ].join(' '),
        },
    });
    updateElement(cardTitleText, {
        transition: duration,
        addClasses: 'text-4xl font-semibold text-shadow',
        removeClasses: 'text-shadow-transparent',
    });
    updateElement(cardTitleBackground, {
        transition: duration,
        styles: { opacity: '0' },
    });

    await after({ milliseconds: duration });
});
</script>
