<template>
    <div class="flex flex-grow overflow-hidden flex-col min-h-full">
        <div class="flex relative justify-center items-end w-full h-52 md:h-80 recipe-page--header">
            <slot name="image">
                <RecipeImage :url="recipe?.imageUrl" class="absolute inset-0" />
            </slot>
            <div
                class="absolute inset-x-0 top-0 recipe-page--header-overlay"
                :class="{ 'bg-gradient-to-b to-transparent from-dark-overlay': !$app.isOnboarding }"
                :style="`height: ${$ui.headerHeight}px`"
            />
            <div class="flex relative justify-center pb-4 w-full mx-edge recipe-page--header-wrapper">
                <div class="flex-grow pr-36 mr-8 max-w-readable recipe-page--header-title-wrapper">
                    <slot name="title" />
                </div>
                <div class="w-72" />
            </div>
        </div>
        <div class="flex flex-grow justify-center pt-4 bg-white recipe-page--body">
            <div class="flex-grow mx-edge">
                <div class="flex flex-col justify-center md:flex-row">
                    <div class="mr-8 prose">
                        <slot name="description">
                            <CoreMarkdown v-if="recipe?.description" :text="recipe.description" />
                        </slot>
                        <template v-if="$slots.ingredients || ingredients.length > 0">
                            <h2>{{ $t('recipes.ingredients') }}</h2>
                            <slot name="ingredients">
                                <div v-if="ingredients.length > 0" class="not-prose">
                                    <ul class="text-gray-700">
                                        <li
                                            v-for="(ingredient, index) of ingredients"
                                            :key="index"
                                            class="flex items-center my-2"
                                        >
                                            <span class="flex justify-center items-center w-8">
                                                <span class="w-2 h-2 bg-gray-300 rounded-full" />
                                            </span>
                                            <span class="border-b-2 border-transparent">
                                                {{ ingredient }}
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </slot>
                        </template>
                        <template v-if="$slots.instructions || instructions.length > 0">
                            <h2>{{ $t('recipes.instructions') }}</h2>
                            <slot name="instructions">
                                <ol v-if="recipe && recipe.instructionSteps.length > 0" class="pl-0 list-none">
                                    <li
                                        v-for="(instructionStep, index) of instructions"
                                        :key="instructionStep.position"
                                    >
                                        <div class="flex">
                                            <span class="flex justify-center text-lg font-semibold min-w-clickable text-primary-600" aria-hidden="true">
                                                {{ index + 1 }}.
                                            </span>
                                            <CoreMarkdown :text="instructionStep.text" />
                                        </div>
                                    </li>
                                </ol>
                            </slot>
                        </template>
                        <CoreProseFiller />
                    </div>
                    <div
                        class="flex-shrink-0 w-72"
                        :style="`transform:translateY(-${metadataHeight}px)`"
                    >
                        <div class="relative">
                            <svg
                                preserveAspectRatio="none"
                                class="absolute -top-4 right-1/2 text-white translate-x-1/2 pointer-events-none fill-current recipe-page--metadata-decoration"
                                viewBox="0 0 260 30"
                                :style="`height:${metadataHeight}px;width:400%`"
                            >
                                <path d="M0 30.206s71.996 1.005 83-17c11.852-19.392 84.385-15.73 94 0 11.003 18 83 17 83 17z" />
                            </svg>
                            <div class="relative">
                                <slot name="metadata">
                                    <RecipePageMetadata v-if="recipe?.servings || recipe?.prepTime || recipe?.cookTime" class="w-full">
                                        <template v-if="recipe.servings" #servings>
                                            {{ recipe.servings }}
                                        </template>
                                        <template v-if="recipe.prepTime" #prepTime>
                                            {{ recipe.prepTime }}
                                        </template>
                                        <template v-if="recipe.cookTime" #cookTime>
                                            {{ recipe.cookTime }}
                                        </template>
                                    </RecipePageMetadata>
                                </slot>
                            </div>
                        </div>
                        <div :class="metadataRows > 0 && 'mt-6'" />
                        <slot name="urls">
                            <ul v-if="externalUrls.length > 0" class="mb-4">
                                <li v-for="(externalUrl, index) of externalUrls" :key="index">
                                    <CoreLink :url="externalUrl.url" class="flex items-center space-x-1">
                                        <i-pepicons-chain class="w-4 h-4" aria-hidden="true" />
                                        <span>{{ $t('recipes.externalUrl', { domain: externalUrl.domain }) }}</span>
                                    </CoreLink>
                                </li>
                            </ul>
                        </slot>
                        <slot name="actions" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { arrayFilter, arraySorted, urlParse } from '@noeldemartin/utils';
import type { PropType } from 'vue';

import TailwindCSS from '@/framework/utils/tailwindcss';

import type Recipe from '@/models/Recipe';

const { recipe } = defineProps({
    recipe: {
        type: Object as PropType<Recipe | null>,
        default: null,
    },
});

const metadataRows = $computed(
    () =>
        recipe
            ? arrayFilter([recipe.servings, recipe.prepTime, recipe.cookTime]).length
            : 3,
);
const metadataHeight = $computed(
    () =>
        metadataRows
            ? metadataRows * TailwindCSS.pixels('spacing.10') + 2 * TailwindCSS.pixels('spacing.4')
            : 0,
);

const ingredients = $computed(() => recipe?.sortedIngredients ?? []);
const instructions = $computed(() => arraySorted(recipe?.instructions ?? [], 'position'));
const externalUrls = $computed(
    () => (recipe?.sortedExternalUrls ?? []).map(url => ({
        url,
        domain: urlParse(url)?.domain?.replace(/^www\./, ''),
    })),
);
</script>
