<template>
    <div
        v-element-transitions="{
            name: 'recipe-details',
            id: recipe.url,
            transitions: {
                enter: enterTransition,
                'recipe-card': transitionToCard,
            },
        }"
        class="flex flex-col min-h-full"
    >
        <div class="flex relative justify-center items-end w-full h-52 md:h-80 recipe-details--header">
            <RecipeImage :recipe="recipe" class="absolute inset-0" />
            <div class="absolute inset-x-0 top-0 bg-gradient-to-b to-transparent from-dark-overlay recipe-details--header-overlay" :style="`height: ${$ui.headerHeight}px`" />
            <div class="relative pb-4 w-full mx-edge max-w-content recipe-details--header-wrapper">
                <h1 id="recipe-title" class="text-4xl font-semibold text-white recipe-details--header-title text-shadow">
                    <span class="recipe-details--header-title-text">{{ recipe.name }}</span>
                </h1>
            </div>
        </div>
        <div class="flex flex-grow justify-center pt-4 bg-white recipe-details--body">
            <div class="flex-grow max-w-content mx-edge">
                <div class="flex flex-col md:flex-row">
                    <ul v-if="recipe.servings || recipe.prepTime || recipe.cookTime" class="flex justify-between mb-4 text-gray-700 md:hidden">
                        <li v-if="recipe.servings" class="flex flex-col items-center">
                            <div class="flex items-center mb-1 space-x-1">
                                <i-zondicons-location-food class="w-3 h-3" /> <strong>{{ $t('recipes.servings') }}</strong>
                            </div>
                            <span>{{ recipe.servings }}</span>
                        </li>
                        <li v-if="recipe.prepTime" class="flex flex-col items-center">
                            <div class="flex items-center mb-1 space-x-1">
                                <i-zondicons-hour-glass class="w-3 h-3" /> <strong>{{ $t('recipes.prepTime') }}</strong>
                            </div>
                            <span>{{ recipe.prepTime }}</span>
                        </li>
                        <li v-if="recipe.cookTime" class="flex flex-col items-center">
                            <div class="flex items-center mb-1 space-x-1">
                                <i-zondicons-time class="w-3 h-3" /> <strong>{{ $t('recipes.cookTime') }}</strong>
                            </div>
                            <span>{{ recipe.cookTime }}</span>
                        </li>
                    </ul>
                    <div class="prose">
                        <!-- TODO support markdown -->
                        <p v-if="recipe.description">
                            {{ recipe.description }}
                        </p>
                        <template v-if="recipe.ingredients.length > 0">
                            <h2>{{ $t('recipes.ingredients') }}</h2>
                            <ul>
                                <li v-for="(ingredient, index) of recipe.ingredients" :key="index">
                                    {{ ingredient }}
                                </li>
                            </ul>
                        </template>
                        <template v-if="recipe.instructions && recipe.instructions.length > 0">
                            <h2>{{ $t('recipes.instructions') }}</h2>
                            <ol>
                                <li v-for="instructionStep of recipe.instructions" :key="instructionStep.position">
                                    {{ instructionStep.text }}
                                </li>
                            </ol>
                        </template>
                    </div>
                    <div class="flex-grow" />
                    <div class="w-full md:w-72">
                        <ul v-if="recipe.servings || recipe.prepTime || recipe.cookTime" class="hidden mb-2 space-y-2 text-gray-700 md:block">
                            <li v-if="recipe.servings" class="flex items-center space-x-1">
                                <i-zondicons-location-food class="w-3 h-3" />
                                <strong>{{ $t('recipes.servings') }}</strong>
                                <div class="flex-grow" />
                                <span>{{ recipe.servings }}</span>
                            </li>
                            <li v-if="recipe.prepTime" class="flex items-center space-x-1">
                                <i-zondicons-hour-glass class="w-3 h-3" />
                                <strong>{{ $t('recipes.prepTime') }}</strong>
                                <div class="flex-grow" />
                                <span>{{ recipe.prepTime }}</span>
                            </li>
                            <li v-if="recipe.cookTime" class="flex items-center space-x-1">
                                <i-zondicons-time class="w-3 h-3" />
                                <strong>{{ $t('recipes.cookTime') }}</strong>
                                <div class="flex-grow" />
                                <span>{{ recipe.cookTime }}</span>
                            </li>
                        </ul>

                        <BaseButton
                            class="!justify-start mt-2 w-full"
                            secondary
                            route="recipes.edit"
                            :route-params="{ recipe: recipe.uuid }"
                        >
                            <i-zondicons-edit-pencil class="mr-2 w-4 h-4" /> {{ $t('recipes.edit') }}
                        </BaseButton>
                        <BaseButton secondary class="!justify-start mt-2 w-full" @click="deleteRecipe()">
                            <i-zondicons-trash class="mr-2 w-4 h-4" /> {{ $t('recipes.delete') }}
                        </BaseButton>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { after } from '@noeldemartin/utils';
import { defineProps } from 'vue';
import type { PropType } from 'vue';

import TailwindCSS from '@/framework/utils/tailwindcss';
import { defineElementTransition, defineEnterTransition } from '@/framework/core/services/ElementTransitionsService';
import { afterElementsUpdated, updateElement } from '@/framework/utils/dom';

import type Recipe from '@/models/Recipe';

defineProps({
    recipe: {
        type: Object as PropType<Recipe>,
        required: true,
    },
});

async function hideBody(wrapper: HTMLElement, details: HTMLElement): Promise<void> {
    const duration = 300;
    const detailsHeader = details.querySelector('.recipe-details--header') as HTMLElement;
    const detailsBody = details.querySelector('.recipe-details--body') as HTMLElement;

    // Prepare elements
    updateElement(wrapper, { addClasses: 'z-10' });
    updateElement(detailsHeader, { addClasses: 'z-10' });
    updateElement(detailsBody, { addClasses: 'transform translate-y-0' });

    await afterElementsUpdated();

    // Transition
    updateElement(detailsBody, {
        transition: duration,
        addClasses: '-translate-y-full',
        removeClasses: 'translate-y-0',
    });

    await after({ milliseconds: duration });

    // Clean up
    updateElement(detailsBody, {
        addClasses: 'opacity-0',
        styles: { transition: 'none' },
    });
}

async function transitionHeaderToCard(wrapper: HTMLElement, details: HTMLElement, card: HTMLElement): Promise<void> {
    const duration = 600;
    const wrapperBoundingRect = wrapper.getBoundingClientRect();
    const detailsHeader = details.querySelector('.recipe-details--header') as HTMLElement;
    const detailsHeaderBoundingRect = detailsHeader.getBoundingClientRect();
    const detailsHeaderWrapper = details.querySelector('.recipe-details--header-wrapper') as HTMLElement;
    const detailsHeaderOverlay = details.querySelector('.recipe-details--header-overlay') as HTMLElement;
    const detailsHeaderTitle = details.querySelector('.recipe-details--header-title') as HTMLElement;
    const detailsHeaderTitleText = details.querySelector('.recipe-details--header-title-text') as HTMLElement;
    const detailsHeaderTitleBackground = document.createElement('div');
    const cardBoundingRect = card.getBoundingClientRect();

    // Prepare elements
    updateElement(detailsHeader, {
        addClasses: 'overflow-hidden z-10 relative',
        removeClasses: 'justify-center',
        boundingDimensions: detailsHeaderBoundingRect,
    });
    updateElement(detailsHeaderWrapper, { removeClasses: 'max-w-content pb-4 mx-edge' });
    updateElement(detailsHeaderTitle, {
        addClasses: 'relative',
        prepend: detailsHeaderTitleBackground,
        styles: {
            padding: [
                TailwindCSS.css('spacing.4'),
                TailwindCSS.css('spacing.4'),
                TailwindCSS.css('spacing.4'),
                Math.max(
                    TailwindCSS.pixels('spacing.edge'),
                    (wrapperBoundingRect.width - TailwindCSS.pixels('spacing.content')) / 2,
                ) + 'px',
            ].join(' '),
        },
    });
    updateElement(detailsHeaderTitleText, { addClasses: 'relative' });
    updateElement(detailsHeaderTitleBackground, {
        addClasses: 'opacity-0 absolute inset-0 bg-gradient-to-t to-transparent from-dark-overlay',
    });

    await afterElementsUpdated();

    // Transition
    updateElement(wrapper, {
        transition: duration,
        styles: {
            top: `${cardBoundingRect.top}px`,
            left: `${cardBoundingRect.left}px`,
        },
    });
    updateElement(detailsHeader, {
        transition: duration,
        addClasses: 'rounded-lg',
        boundingDimensions: cardBoundingRect,
    });
    updateElement(detailsHeaderOverlay, {
        transition: duration,
        addClasses: 'opacity-0',
    });
    updateElement(detailsHeaderTitle, {
        transition: duration,
        addClasses: 'text-lg text-shadow-transparent',
        removeClasses: 'text-4xl text-shadow',
        styles: { padding: TailwindCSS.css('spacing.2') },
    });
    updateElement(detailsHeaderTitleBackground, {
        transition: duration,
        addClasses: 'opacity-100',
        removeClasses: 'opacity-0',
    });

    await after({ milliseconds: duration });
}

const enterTransition = defineEnterTransition(async details => {
    const duration = 300;
    const detailsHeader = details.querySelector('.recipe-details--header') as HTMLElement;
    const detailsBody = details.querySelector('.recipe-details--body') as HTMLElement;

    // Prepare elements
    updateElement(detailsHeader, { addClasses: 'z-10' });
    updateElement(detailsBody, { addClasses: 'transform -translate-y-full' });

    await afterElementsUpdated();

    // Transition
    updateElement(detailsBody, {
        transition: duration,
        addClasses: 'translate-y-0',
        removeClasses: '-translate-y-full',
    });

    await after({ milliseconds: duration });

    // Clean up
    updateElement(detailsHeader, { removeClasses: 'z-10' });
    updateElement(detailsBody, { resetStyles: true, removeClasses: 'transform translate-y-0' });
});

const transitionToCard = defineElementTransition(async (wrapper, details, card) => {
    await hideBody(wrapper, details);
    await transitionHeaderToCard(wrapper, details, card);
});

async function deleteRecipe() {
    // TODO
}
</script>
