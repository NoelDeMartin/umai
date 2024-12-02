<template>
    <div class="flex flex-col flex-grow overflow-hidden w-screen min-h-full print:min-h-[auto] print:block">
        <div class="recipe-page--image fixed inset-x-0 top-0 h-52 md:h-80 print:hidden">
            <slot name="image">
                <RecipeImage :recipe="recipe" class="absolute inset-0" />
            </slot>
        </div>
        <div
            class="recipe-page--wrapper flex flex-col flex-grow w-[200vw] z-10 md:w-full pointer-events-none print:w-auto print:block print:translate-x-0"
            :class="{
                'transition-transform duration-300': $ui.animations && $ui.isMobile,
                '-translate-x-screen': $ui.isMobile && showingSecondaryPanel,
                'translate-x-0': $ui.isMobile && !showingSecondaryPanel,
            }"
        >
            <div class="recipe-page--header flex relative justify-start items-end h-52 md:h-80 md:justify-center print:h-auto md:print:h-auto print:block">
                <div
                    style="height: var(--header-height)"
                    class="recipe-page--header-overlay absolute inset-x-0 top-0 bg-gradient-to-b to-transparent from-dark-overlay print:hidden"
                    :class="{ 'opacity-0': $app.isOnboarding }"
                />
                <div class="recipe-page--header-wrapper flex relative pb-4 w-screen justify-center px-edge overflow-hidden md:w-full">
                    <div class="recipe-page--header-title-wrapper flex-grow mr-8 max-w-prose pointer-events-auto md:pr-36 print:mr-0 md:print:pr-0">
                        <slot name="title" />
                    </div>
                    <div class="recipe-page--header-title-filler w-72 flex-shrink-0 hidden md:block md:print:hidden print:hidden" />
                </div>
                <div class="hidden overflow-hidden rounded-lg border border-gray-300 print:block">
                    <div v-if="recipe?.imageUrl" class="relative overflow-hidden w-full h-52">
                        <RecipeImage :recipe="recipe" class="absolute inset-0" />
                    </div>
                    <ul v-if="recipe && hasMetadata" class="flex bg-gray-200 print-bg p-2 pt-4">
                        <li class="w-1/3 flex flex-col items-center">
                            <div class="flex items-center align-center">
                                <i-pepicons-knive-fork class="w-4 h-4" aria-hidden="true" />
                                <span class="ml-1">{{ $t('recipes.servings') }}</span>
                            </div>
                            <p class="text-sm mt-1">
                                {{ renderedServings ?? '-' }}
                            </p>
                        </li>
                        <li class="w-1/3 flex flex-col items-center">
                            <div class="flex items-center align-center">
                                <i-pepicons-hourglass class="w-4 h-4" aria-hidden="true" />
                                <span class="ml-1">{{ $t('recipes.prepTime') }}</span>
                            </div>
                            <p class="text-sm mt-1">
                                {{ renderedPrepTime ?? '-' }}
                            </p>
                        </li>
                        <li class="w-1/3 flex flex-col items-center">
                            <div class="flex items-center align-center">
                                <i-pepicons-stopwatch class="w-4 h-4" aria-hidden="true" />
                                <span class="ml-1">{{ $t('recipes.cookTime') }}</span>
                            </div>
                            <p class="text-sm mt-1">
                                {{ renderedCookTime ?? '-' }}
                            </p>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="recipe-page--body relative flex flex-grow flex-row justify-center pt-4 bg-white pointer-events-auto md:px-edge print:block">
                <div
                    v-if="$ui.isMobile"
                    class="recipe-page--body-switch absolute -translate-x-1/2 -translate-y-full left-1/2 top-0 z-10 flex pt-2 px-3 print:hidden"
                >
                    <svg
                        preserveAspectRatio="none"
                        class="absolute -translate-x-1/2 left-1/2 bottom-0 w-[150%] h-full fill-white print:h-auto"
                        viewBox="0 0 200 80"
                    >
                        <path d="M40 45C35.003 79.997 0 80 0 80h200s-34.998.004-40-35C154.998 9.996 135.004-.003 100 0 64.996.003 44.997 10.003 40 45Z" />
                    </svg>
                    <button
                        type="button"
                        class="p-2 z-10 active:text-primary-900 focus:text-primary-900"
                        :aria-label="$t('recipes.showMainPanel')"
                        :title="$t('recipes.showMainPanel')"
                        @click="showingSecondaryPanel = true"
                    >
                        <i-pepicons-triangle-left-filled class="w-8 h-8" aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        class="p-2 z-10 active:text-primary-900 focus:text-primary-900"
                        :aria-label="$t('recipes.showSecondaryPanel')"
                        :title="$t('recipes.showSecondaryPanel')"
                        @click="showingSecondaryPanel = false"
                    >
                        <i-pepicons-triangle-right-filled class="w-8 h-8" aria-hidden="true" />
                    </button>
                </div>
                <div class="prose prose-h2:mt-6 px-edge w-screen md:mr-8 md:px-0 md:w-auto md:print:mr-0">
                    <slot name="description">
                        <CoreMarkdown
                            v-if="recipe?.description"
                            auto-link="recipes"
                            :text="recipe.description"
                            class="break-inside-avoid"
                        />
                    </slot>
                    <template v-if="$slots.ingredients || ingredients.length > 0">
                        <h2>{{ $t('recipes.ingredients') }}</h2>
                        <slot name="ingredients">
                            <div v-if="ingredients.length > 0" class="not-prose">
                                <ul class="text-gray-700 print:list-disc print:list-inside print:flex print:flex-wrap print:pl-2">
                                    <li
                                        v-for="(ingredient, index) of ingredients"
                                        :key="index"
                                        class="flex items-center my-2 break-inside-avoid print:list-item print:w-1/2"
                                    >
                                        <span class="flex justify-center items-center w-8 flex-shrink-0 print:hidden">
                                            <span class="w-2 h-2 bg-gray-300 rounded-full" />
                                        </span>
                                        <CoreMarkdown
                                            class="border-b-2 border-transparent"
                                            inline
                                            tag="span"
                                            auto-link="recipes"
                                            :text="ingredient"
                                        />
                                    </li>
                                </ul>
                            </div>
                        </slot>
                    </template>
                    <template v-if="$slots.instructions || instructions.length > 0">
                        <h2>{{ $t('recipes.instructions') }}</h2>
                        <slot name="instructions">
                            <CoreMarkdown v-if="instructions.length === 1" :text="instructions[0]?.text" auto-link="recipes" />
                            <ol v-else-if="instructions.length > 0" class="pl-0 list-none">
                                <li
                                    v-for="(instructionStep, index) of instructions"
                                    :key="instructionStep.position"
                                    class="pl-0 break-inside-avoid"
                                >
                                    <div class="flex">
                                        <span class="flex justify-center text-lg font-semibold min-w-clickable text-primary-600" aria-hidden="true">
                                            {{ index + 1 }}.
                                        </span>
                                        <CoreMarkdown :text="instructionStep.text" auto-link="recipes" />
                                    </div>
                                </li>
                            </ol>
                        </slot>
                    </template>
                    <div v-if="externalUrls.length > 0" class="hidden print:block">
                        <h2>{{ $t('recipes.printUrls') }}</h2>
                        <ul class="text-gray-700 pl-2 not-prose">
                            <li v-for="(externalUrl, index) of externalUrls" :key="index">
                                <CoreLink :url="externalUrl.url" class="prose flex items-center">
                                    <i-pepicons-chain class="w-4 h-4 mr-1 inline" aria-hidden="true" />
                                    {{ externalUrl.url }}
                                </CoreLink>
                            </li>
                        </ul>
                    </div>
                    <CoreProseFiller />
                </div>
                <div
                    class="w-screen px-edge flex-shrink-0 md:w-72 md:px-0 print:hidden"
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
                                <RecipePageMetadata v-if="recipe && hasMetadata" class="w-full">
                                    <template v-if="recipe.servingsBreakdown" #servings>
                                        <div class="flex items-center space-x-1">
                                            <CoreSelect
                                                v-if="servingsOptions"
                                                v-model="servings"
                                                class="pt-0 p-1 -mr-1.5 bg-left text-right"
                                                :label="$t('recipes.servings_change')"
                                                :options="servingsOptions"
                                            />
                                            <span v-else>{{ recipe.servings }}</span>
                                        </div>
                                    </template>
                                    <template v-if="recipe.prepTime" #prepTime>
                                        {{ renderedPrepTime }}
                                    </template>
                                    <template v-if="recipe.cookTime" #cookTime>
                                        {{ renderedCookTime }}
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
                                        <i-pepicons-chain class="w-4 h-4 shrink-0" aria-hidden="true" />
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
import { arrayFilter, arraySorted, arrayUnique, range, urlParse } from '@noeldemartin/utils';
import { nextTick, watchEffect } from 'vue';

import TailwindCSS from '@/framework/utils/tailwindcss';
import UI from '@/framework/core/facades/UI';
import { afterAnimationTime } from '@/framework/utils/dom';
import { defineSelectOption } from '@/framework/components/headless/HeadlessSelect';
import { objectProp } from '@/framework/utils/vue';
import { translate } from '@/framework/utils/translate';
import type { SelectOption } from '@/framework/components/headless/HeadlessSelect';

import type Recipe from '@/models/Recipe';

import type IRecipePage from './RecipePage';

const CUSTOM_SERVINGS = -1;

const { recipe } = defineProps({
    recipe: objectProp<Recipe>(),
});

let showingSecondaryPanel = $ref<boolean>(false);
let servings = $ref(recipe?.servingsBreakdown?.quantity ?? 1);
const customServingsQuantities = $ref<number[]>([]);
const servingsOptions = $computed((): SelectOption<number>[] | null => {
    const servingsBreakdown = recipe?.servingsBreakdown;

    if (!servingsBreakdown) {
        return null;
    }

    const defaultQuantity = recipe?.servingsBreakdown?.quantity ?? 1;
    const options = arraySorted(arrayUnique([
        ...range(10)
            .map(quantity => quantity + 1)
            .map(quantity => quantity * 10 ** Math.floor(Math.log10(defaultQuantity))),
        ...customServingsQuantities,
        defaultQuantity,
        servings,
    ]), (a, b) => a > b ? 1 : -1)
        .map(quantity => defineSelectOption<number>({
            text: servingsBreakdown.renderQuantity(quantity),
            value: quantity,
        }));

    options.push({
        text: translate('recipes.servings_custom'),
        value: CUSTOM_SERVINGS,
    });

    return options;
});
const hasMetadata = $computed(() => !!(recipe?.servings || recipe?.prepTime || recipe?.cookTime));
const renderedServings = $computed(() => {
    if (servingsOptions) {
        return servingsOptions.find(option => option.value === servings)?.text;
    }

    return recipe?.servings ?? null;
});
const renderedPrepTime = $computed(() => recipe?.prepTime && UI.renderDuration(recipe.prepTime));
const renderedCookTime = $computed(() => recipe?.cookTime && UI.renderDuration(recipe.cookTime));
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
const ingredients = $computed(() => {
    const ingredientsBreakdown = recipe?.sortedIngredientsBreakdown;
    const originalServings = recipe?.servingsBreakdown?.quantity;
    const ingredientsMultiplier = servings / (originalServings ?? servings);

    if (!recipe?.servings || servings === CUSTOM_SERVINGS) {
        return ingredientsBreakdown?.map(({ original }) => original) ?? [];
    }

    return ingredientsBreakdown?.map(({ quantity, original, unitMultiplier, renderQuantity }) => {
        if (!quantity) {
            return original;
        }

        return Array.isArray(quantity)
            ? renderQuantity(quantity.map(q => roundIngredientQuantity(q * ingredientsMultiplier)) as [number, number])
            : renderQuantity(roundIngredientQuantity(quantity * ingredientsMultiplier / (unitMultiplier ?? 1)));
    }) ?? [];
});
const instructions = $computed(() => arraySorted(recipe?.instructions ?? [], 'position'));
const externalUrls = $computed(
    () => (recipe?.sortedExternalUrls ?? []).map(url => ({
        url,
        domain: urlParse(url)?.domain?.replace(/^www\./, ''),
    })),
);

function roundIngredientQuantity(quantity: number): number {
    if (quantity < 10) {
        return Math.round(quantity * 100) / 100;
    }

    return Math.round(quantity);
}

watchEffect(async () => {
    if (servings !== CUSTOM_SERVINGS) {
        return;
    }

    const newServings = parseInt(prompt(translate('recipes.servings_customPrompt')) || 'NaN');

    if (!newServings) {
        await nextTick();

        servings = recipe?.servingsBreakdown?.quantity ?? 1;

        return;
    }

    customServingsQuantities.push(newServings);

    await nextTick();

    servings = newServings;
});

defineExpose<IRecipePage>({
    showPrimaryPanel: async () => {
        showingSecondaryPanel = false;

        if (UI.isMobile) {
            await afterAnimationTime(300);
        }
    },
    showSecondaryPanel: async () => {
        showingSecondaryPanel = true;

        if (UI.isMobile) {
            await afterAnimationTime(300);
        }
    },
});
</script>
