<template>
    <RecipePage
        ref="$recipePage"
        v-element-transitions="{
            name: 'recipe-details',
            id: recipe.url,
            transitions: {
                enter: enterTransition,
                'recipe-card': transitionToCard,
            },
        }"
        :recipe="recipe"
    >
        <template #title>
            <h1 id="recipe-details-title" class="text-4xl font-semibold text-white recipe-details--header-title text-shadow">
                <span class="recipe-details--header-title-text">{{ recipe.name }}</span>
            </h1>
        </template>

        <template #actions>
            <StrokeButton class="w-full" route="recipes.edit" :route-params="{ recipe: recipe.uuid }">
                <i-zondicons-edit-pencil class="mr-2 w-4 h-4" /> {{ $t('recipes.edit') }}
            </StrokeButton>
            <StrokeButton class="mt-2 w-full" @click="$ui.openModal(ShareRecipeModal, { recipe })">
                <i-zondicons-share class="mr-2 w-4 h-4" /> {{ $t('recipes.share') }}
            </StrokeButton>
        </template>
    </RecipePage>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';

import TailwindCSS from '@/framework/utils/tailwindcss';
import { animateElements, requireChildElement } from '@/framework/utils/dom';
import { defineElementTransition, defineEnterTransition } from '@/framework/core/services/ElementTransitionsService';

import ShareRecipeModal from '@/components/modals/ShareRecipeModal.vue';
import { bodySlideUp, headerDelay } from '@/components/recipe/RecipePage.transitions';
import type Recipe from '@/models/Recipe';

const { recipe } = defineProps({
    recipe: {
        type: Object as PropType<Recipe>,
        required: true,
    },
});

const $recipePage = $ref<null>(null);

const enterTransition = defineEnterTransition(async ($root, previous) => {
    if (previous?.config.name === 'recipe-card') {
        const duration = 500;

        await Promise.all([
            headerDelay($root, duration),
            bodySlideUp($root, duration),
        ]);

        return;
    }

    const duration = 500;
    const $detailsHeader = requireChildElement($root, '.recipe-page--header');
    const $detailsBody = requireChildElement($root, '.recipe-page--body');
    const $detailsMetadataDecoration = requireChildElement($root, '.recipe-page--metadata-decoration');
    const detailsBodyBoundingRect = $detailsBody.getBoundingClientRect();

    await animateElements({ duration }, [
        {
            element: $detailsHeader,
            before: { addClasses: 'opacity-0' },
            after: { removeClasses: 'opacity-0' },
        },
        {
            element: $detailsBody,
            before: { addClasses: 'z-20' },
            after: { removeClasses: 'z-20' },
            styles: {
                transform: [
                    `translateY(${
                        window.innerHeight - detailsBodyBoundingRect.top + $detailsMetadataDecoration.clientHeight
                    }px)`,
                    'translateY(0)',
                ],
            },
        },
    ]);
});

const transitionToCard = defineElementTransition(async (_, $details, { element: $card }) => {
    const duration = 500;
    const $detailsHeader = requireChildElement($details, '.recipe-page--header');
    const $detailsHeaderWrapper = requireChildElement($details, '.recipe-page--header-wrapper');
    const $detailsHeaderOverlay = requireChildElement($details, '.recipe-page--header-overlay');
    const $detailsHeaderTitle = requireChildElement($details, '.recipe-details--header-title');
    const $detailsHeaderTitleWrapper = requireChildElement($details, '.recipe-page--header-title-wrapper');
    const $detailsHeaderTitleText = requireChildElement($details, '.recipe-details--header-title-text');
    const $detailsHeaderWrapperBackground = document.createElement('div');
    const $detailsBody = requireChildElement($details, '.recipe-page--body');
    const $detailsMetadataDecoration = requireChildElement($details, '.recipe-page--metadata-decoration');
    const $recipesFAB = document.querySelector('.recipes-index--fab') as HTMLElement | null;
    const $footer = document.querySelector('footer') as HTMLElement;
    const detailsHeaderBoundingRect = $detailsHeader.getBoundingClientRect();
    const detailsHeaderTitleBoundingRect = $detailsHeaderTitle.getBoundingClientRect();
    const detailsBodyBoundingRect = $detailsBody.getBoundingClientRect();
    const cardBoundingRect = $card.getBoundingClientRect();

    await animateElements({ duration, fill: 'forwards' }, [
        {
            element: $detailsHeader,
            before: {
                addClasses: 'overflow-hidden z-10 relative',
                removeClasses: 'justify-center',
            },
            classes: { borderRadius: ['rounded-none', 'rounded-lg'] },
            boundingRects: [detailsHeaderBoundingRect, cardBoundingRect],
        },
        { element: $detailsHeaderOverlay, styles: { opacity: [1, 0] } },
        {
            element: $detailsHeaderWrapper,
            before: {
                removeClasses: 'justify-center pb-4 mx-edge',
                prepend: $detailsHeaderWrapperBackground,
            },
        },
        {
            element: $detailsHeaderWrapperBackground,
            before: {
                addClasses: 'opacity-0 absolute inset-0 bg-gradient-to-t to-transparent from-dark-overlay',
            },
            styles: { opacity: [0, 1] },
        },
        {
            element: $detailsHeaderTitleWrapper,
            before: {
                addClasses: 'w-full flex-shrink-0',
                removeClasses: 'pr-36 max-w-readable',
            },
        },
        {
            element: $detailsHeaderTitle,
            before: { addClasses: 'relative w-full' },
            classes: {
                paddingTop: ['p-4', 'p-2'],
                paddingRight: ['p-4', 'p-2'],
                paddingBottom: ['p-4', 'p-2'],
                textShadow: ['text-shadow', 'text-shadow-transparent'],
                fontSize: ['text-4xl', 'text-lg'],
            },
            styles: {
                paddingLeft: [
                    `${detailsHeaderTitleBoundingRect.left}px`,
                    TailwindCSS.css('spacing.2'),
                ],
            },
        },
        {
            element: $detailsHeaderTitleText,
            before: { addClasses: 'relative' },
        },
        {
            element: $detailsBody,
            before: {
                addClasses: 'z-20 fixed w-full',
                styles: {
                    height: Math.max(
                        detailsBodyBoundingRect.height,
                        window.innerHeight - detailsHeaderBoundingRect.height,
                    ) + 'px',
                },
            },
            styles: {
                top: [
                    `${detailsBodyBoundingRect.top}px`,
                    `${window.innerHeight + $detailsMetadataDecoration.clientHeight}px`,
                ],
            },
        },
        $recipesFAB && {
            element: $recipesFAB,
            before: { styles: { zIndex: '0' } },
            after: { resetStyles: true },
        },
        {
            element: $footer,
            before: { addClasses: 'z-50' },
            after: { removeClasses: 'z-50' },
        },
    ]);
});
</script>
