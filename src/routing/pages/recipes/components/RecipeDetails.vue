<template>
    <RecipePageLayout
        v-element-transitions="{
            name: 'recipe-details',
            id: recipe.url,
            transitions: {
                enter: enterTransition,
                'recipe-card': transitionToCard,
            },
        }"
        :metadata-rows="metadataRows"
    >
        <template #image>
            <RecipeImage :url="recipe.imageUrl" class="absolute inset-0" />
        </template>

        <template #title>
            <h1 id="recipe-details-title" class="text-4xl font-semibold text-white recipe-details--header-title text-shadow">
                <span class="recipe-details--header-title-text">{{ recipe.name }}</span>
            </h1>
        </template>

        <template v-if="recipe.description" #description>
            <BaseMarkdown :text="recipe.description" />
        </template>

        <template v-if="recipe.ingredients.length > 0" #ingredients>
            <div class="not-prose">
                <ul class="text-gray-700">
                    <li
                        v-for="(ingredient, index) of recipe.ingredients"
                        :key="index"
                        class="flex items-center"
                    >
                        <span aria-hidden="true" class="flex justify-center items-center text-2xl text-gray-300 w-clickable group-hover:hidden">
                            •
                        </span>
                        <span class="border-b-2 border-transparent">
                            {{ ingredient }}
                        </span>
                    </li>
                </ul>
            </div>
        </template>

        <template v-if="instructions.length > 0" #instructions>
            <ol>
                <li v-for="instructionStep of instructions" :key="instructionStep.position">
                    <BaseMarkdown :text="instructionStep.text" />
                </li>
            </ol>
        </template>

        <template #metadata>
            <table v-if="recipe.servings || recipe.prepTime || recipe.cookTime" class="w-full">
                <tr v-if="recipe.servings" class="h-10">
                    <th>
                        <div class="flex items-center space-x-2">
                            <i-zondicons-location-food class="w-3 h-3" />
                            <span>{{ $t('recipes.servings') }}</span>
                        </div>
                    </th>
                    <td>{{ recipe.servings }}</td>
                </tr>
                <tr v-if="recipe.prepTime" class="h-10">
                    <th>
                        <div class="flex items-center space-x-2">
                            <i-zondicons-hour-glass class="w-3 h-3" />
                            <span>{{ $t('recipes.prepTime') }}</span>
                        </div>
                    </th>
                    <td>{{ recipe.prepTime }}</td>
                </tr>
                <tr v-if="recipe.cookTime" class="h-10">
                    <th>
                        <div class="flex items-center space-x-2">
                            <i-zondicons-time class="w-3 h-3" />
                            <span>{{ $t('recipes.cookTime') }}</span>
                        </div>
                    </th>
                    <td>{{ recipe.cookTime }}</td>
                </tr>
            </table>
        </template>

        <template #actions>
            <StrokeButton class="w-full" route="recipes.edit" :route-params="{ recipe: recipe.uuid }">
                <i-zondicons-edit-pencil class="mr-2 w-4 h-4" /> {{ $t('recipes.edit') }}
            </StrokeButton>
            <StrokeButton class="mt-2 w-full" @click="deleteRecipe()">
                <i-zondicons-trash class="mr-2 w-4 h-4" /> {{ $t('recipes.delete') }}
            </StrokeButton>
        </template>
    </RecipePageLayout>
</template>

<script setup lang="ts">
import { arrayFilter, arraySorted } from '@noeldemartin/utils';
import type { PropType } from 'vue';

import TailwindCSS from '@/framework/utils/tailwindcss';
import { animateElements } from '@/framework/utils/dom';
import { defineElementTransition, defineEnterTransition } from '@/framework/core/services/ElementTransitionsService';

import type Recipe from '@/models/Recipe';

const { recipe } = defineProps({
    recipe: {
        type: Object as PropType<Recipe>,
        required: true,
    },
});

const metadataRows = $computed(() => arrayFilter([recipe.servings, recipe.prepTime, recipe.cookTime]).length);

// TODO sort in model
const instructions = $computed(() => arraySorted(recipe.instructions ?? [], 'position'));

const enterTransition = defineEnterTransition(async details => {
    const duration = 500;
    const detailsHeader = details.querySelector('.recipe-details--header') as HTMLElement;
    const detailsBody = details.querySelector('.recipe-details--body') as HTMLElement;
    const detailsBodyBoundingRect = detailsBody.getBoundingClientRect();
    const detailsMetadataDecoration = details.querySelector('.recipe-page-layout--metadata-decoration') as HTMLElement;

    await animateElements({ duration }, [
        {
            element: detailsHeader,
            before: { addClasses: 'opacity-0' },
            after: { removeClasses: 'opacity-0' },
        },
        {
            element: detailsBody,
            before: { addClasses: 'z-20' },
            after: { removeClasses: 'z-20' },
            styles: {
                transform: [
                    `translateY(${
                        window.innerHeight - detailsBodyBoundingRect.top + detailsMetadataDecoration.clientHeight
                    }px)`,
                    'translateY(0)',
                ],
            },
        },
    ]);
});

const transitionToCard = defineElementTransition(async (_, details, card) => {
    const duration = 500;
    const detailsHeader = details.querySelector('.recipe-details--header') as HTMLElement;
    const detailsHeaderBoundingRect = detailsHeader.getBoundingClientRect();
    const detailsHeaderWrapper = details.querySelector('.recipe-details--header-wrapper') as HTMLElement;
    const detailsHeaderOverlay = details.querySelector('.recipe-details--header-overlay') as HTMLElement;
    const detailsHeaderTitle = details.querySelector('.recipe-details--header-title') as HTMLElement;
    const detailsHeaderTitleBoundingRect = detailsHeaderTitle.getBoundingClientRect();
    const detailsHeaderTitleWrapper = details.querySelector('.recipe-details--header-title-wrapper') as HTMLElement;
    const detailsHeaderTitleText = details.querySelector('.recipe-details--header-title-text') as HTMLElement;
    const detailsHeaderWrapperBackground = document.createElement('div');
    const detailsBody = details.querySelector('.recipe-details--body') as HTMLElement;
    const detailsBodyBoundingRect = detailsBody.getBoundingClientRect();
    const detailsMetadataDecoration = details.querySelector('.recipe-page-layout--metadata-decoration') as HTMLElement;
    const cardBoundingRect = card.getBoundingClientRect();
    const recipesFAB = document.querySelector('.recipes-index--fab') as HTMLElement | null;
    const footer = document.querySelector('footer') as HTMLElement;

    await animateElements({ duration, fill: 'forwards' }, [
        {
            element: detailsHeader,
            before: {
                addClasses: 'overflow-hidden z-10 relative',
                removeClasses: 'justify-center',
            },
            classes: { borderRadius: ['rounded-none', 'rounded-lg'] },
            boundingRects: [detailsHeaderBoundingRect, cardBoundingRect],
        },
        { element: detailsHeaderOverlay, styles: { opacity: [1, 0] } },
        {
            element: detailsHeaderWrapper,
            before: {
                removeClasses: 'justify-center pb-4 mx-edge',
                prepend: detailsHeaderWrapperBackground,
            },
        },
        {
            element: detailsHeaderWrapperBackground,
            before: {
                addClasses: 'opacity-0 absolute inset-0 bg-gradient-to-t to-transparent from-dark-overlay',
            },
            styles: { opacity: [0, 1] },
        },
        {
            element: detailsHeaderTitleWrapper,
            before: {
                addClasses: 'w-full flex-shrink-0',
                removeClasses: 'pr-36 max-w-readable',
            },
        },
        {
            element: detailsHeaderTitle,
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
            element: detailsHeaderTitleText,
            before: { addClasses: 'relative' },
        },
        {
            element: detailsBody,
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
                    `${window.innerHeight + detailsMetadataDecoration.clientHeight}px`,
                ],
            },
        },
        recipesFAB && {
            element: recipesFAB,
            before: { styles: { zIndex: '0' } },
            after: { resetStyles: true },
        },
        {
            element: footer,
            before: { addClasses: 'z-50' },
            after: { removeClasses: 'z-50' },
        },
    ]);
});

async function deleteRecipe() {
    // TODO
}
</script>
