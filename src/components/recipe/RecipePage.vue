<template>
    <div class="flex flex-col flex-grow overflow-hidden w-screen min-h-full">
        <div class="recipe-page--image fixed inset-x-0 top-0 h-52 md:h-80">
            <slot name="image">
                <RecipeImage :recipe="recipe" class="absolute inset-0" />
            </slot>
        </div>
        <div
            class="recipe-page--wrapper flex flex-col flex-grow w-[200vw] z-10 md:w-full pointer-events-none"
            :class="{
                'transition-transform duration-300': $ui.isMobile,
                '-translate-x-screen': $ui.isMobile && showSecondaryPanel,
                'translate-x-0': $ui.isMobile && !showSecondaryPanel,
            }"
        >
            <div class="recipe-page--header flex relative justify-start items-end h-52 md:h-80 md:justify-center">
                <div
                    class="recipe-page--header-overlay absolute inset-x-0 top-0 bg-gradient-to-b to-transparent from-dark-overlay"
                    :class="{ 'opacity-0': $app.isOnboarding }"
                    :style="`height: ${$ui.headerHeight}px`"
                />
                <div class="recipe-page--header-wrapper flex relative pb-4 w-screen justify-center px-edge overflow-hidden md:w-full">
                    <div class="recipe-page--header-title-wrapper flex-grow mr-8 max-w-prose pointer-events-auto md:pr-36">
                        <slot name="title" />
                    </div>
                    <div class="recipe-page--header-title-filler w-72 flex-shrink-0 hidden md:block" />
                </div>
            </div>
            <div class="recipe-page--body relative flex flex-grow flex-row justify-center pt-4 bg-white pointer-events-auto md:px-edge">
                <div
                    v-if="$ui.isMobile"
                    class="recipe-page--body-switch absolute -translate-x-1/2 -translate-y-full left-1/2 top-0 z-10 flex pt-2 px-3"
                >
                    <svg
                        preserveAspectRatio="none"
                        class="absolute -translate-x-1/2 left-1/2 bottom-0 w-[150%] h-full fill-white"
                        viewBox="0 0 200 80"
                    >
                        <path d="M40 45C35.003 79.997 0 80 0 80h200s-34.998.004-40-35C154.998 9.996 135.004-.003 100 0 64.996.003 44.997 10.003 40 45Z" />
                    </svg>
                    <button
                        type="button"
                        class="p-2 z-10 active:text-primary-900 focus:text-primary-900"
                        :aria-label="$t('recipes.showMainPanel')"
                        :title="$t('recipes.showMainPanel')"
                        @click="showSecondaryPanel = true"
                    >
                        <i-pepicons-triangle-left-filled class="w-8 h-8" aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        class="p-2 z-10 active:text-primary-900 focus:text-primary-900"
                        :aria-label="$t('recipes.showSecondaryPanel')"
                        :title="$t('recipes.showSecondaryPanel')"
                        @click="showSecondaryPanel = false"
                    >
                        <i-pepicons-triangle-right-filled class="w-8 h-8" aria-hidden="true" />
                    </button>
                </div>
                <div class="prose prose-h2:mt-6 px-edge w-screen md:mr-8 md:px-0 md:w-auto">
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
                            <ol v-if="recipe && recipe.instructionStepUrls.length > 0" class="pl-0 list-none">
                                <li
                                    v-for="(instructionStep, index) of instructions"
                                    :key="instructionStep.position"
                                    class="pl-0"
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
                    class="w-screen px-edge flex-shrink-0 md:w-72 md:px-0"
                    :style="$ui.isMobile ? '' : `transform:translateY(-${metadataHeight}px)`"
                >
                    <div class="relative">
                        <svg
                            v-if="!$ui.isMobile"
                            preserveAspectRatio="none"
                            class="recipe-page--metadata-decoration absolute -top-4 right-1/2 text-white translate-x-1/2 pointer-events-none fill-current"
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
                    <div class="flex flex-col bg-white flex-grow">
                        <div :class="metadataRows > 0 && 'mt-6'" />
                        <slot name="urls">
                            <h2 class="sr-only">
                                {{ $t('recipes.externalUrls') }}
                            </h2>
                            <ul v-if="externalUrls.length > 0" class="mb-4">
                                <li v-for="(externalUrl, index) of externalUrls" :key="index">
                                    <CoreLink :url="externalUrl.url" class="flex items-center space-x-1">
                                        <i-pepicons-chain class="w-4 h-4" aria-hidden="true" />
                                        <span>
                                            {{ $t('recipes.externalUrl', { domain: externalUrl.domain }) }}
                                        </span>
                                    </CoreLink>
                                </li>
                            </ul>
                        </slot>
                        <div class="mt-4">
                            <slot name="actions" />
                        </div>
                        <div class="flex-grow" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { arrayFilter, arraySorted, urlParse } from '@noeldemartin/utils';

import TailwindCSS from '@/framework/utils/tailwindcss';
import UI from '@/framework/core/facades/UI';
import { afterAnimationTime } from '@/framework/utils/dom';
import { objectProp } from '@/framework/utils/vue';

import type Recipe from '@/models/Recipe';

import type IRecipePage from './RecipePage';

const { recipe } = defineProps({
    recipe: objectProp<Recipe>(),
});

let showSecondaryPanel = $ref(false);
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

defineExpose<IRecipePage>({
    showPrimaryPanel: async () => {
        showSecondaryPanel = false;

        if (UI.isMobile) {
            await afterAnimationTime(300);
        }
    },
    showSecondaryPanel: async () => {
        showSecondaryPanel = true;

        if (UI.isMobile) {
            await afterAnimationTime(300);
        }
    },
});
</script>
