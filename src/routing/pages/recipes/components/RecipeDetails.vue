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
    >
        <template #image>
            <RecipeImage :recipe="recipe" class="absolute inset-0" />
        </template>

        <template #title>
            <h1 id="recipe-details-title" class="text-4xl font-semibold text-white recipe-details--header-title text-shadow">
                <span class="recipe-details--header-title-text">{{ recipe.name }}</span>
            </h1>
        </template>

        <template v-if="recipe.description" #description>
            <!-- TODO support markdown -->
            <p>{{ recipe.description }}</p>
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
                        <span class="py-2 border-b-2 border-transparent">
                            {{ ingredient }}
                        </span>
                    </li>
                </ul>
            </div>
        </template>

        <template v-if="instructions.length > 0" #instructions>
            <ol>
                <li v-for="instructionStep of instructions" :key="instructionStep.position">
                    {{ instructionStep.text }}
                </li>
            </ol>
        </template>

        <template #metadata>
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
        </template>

        <template #actions>
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
        </template>
    </RecipePageLayout>
</template>

<script setup lang="ts">
import { after, arraySorted } from '@noeldemartin/utils';
import { computed } from 'vue';
import type { PropType } from 'vue';

import TailwindCSS from '@/framework/utils/tailwindcss';
import { defineElementTransition, defineEnterTransition } from '@/framework/core/services/ElementTransitionsService';
import { afterElementsUpdated, updateElement } from '@/framework/utils/dom';

import type Recipe from '@/models/Recipe';

const props = defineProps({
    recipe: {
        type: Object as PropType<Recipe>,
        required: true,
    },
});

// TODO sort in model
const instructions = computed(() => arraySorted(props.recipe.instructions ?? [], 'position'));

async function hideBody(wrapper: HTMLElement, details: HTMLElement): Promise<void> {
    const duration = 300;
    const detailsHeader = details.querySelector('.recipe-details--header') as HTMLElement;
    const detailsBody = details.querySelector('.recipe-details--body') as HTMLElement;

    // Prepare elements
    updateElement(wrapper, { addClasses: 'z-10' });
    updateElement(detailsHeader, { addClasses: 'z-10' });
    updateElement(detailsBody, { addClasses: 'translate-y-0' });

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
                    (wrapperBoundingRect.width - TailwindCSS.pixels('spacing.narrowContent')) / 2,
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
    updateElement(detailsBody, { addClasses: '-translate-y-full' });

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
    updateElement(detailsBody, { resetStyles: true, removeClasses: 'translate-y-0' });
});

const transitionToCard = defineElementTransition(async (wrapper, details, card) => {
    await hideBody(wrapper, details);
    await transitionHeaderToCard(wrapper, details, card);
});

async function deleteRecipe() {
    // TODO
}
</script>
