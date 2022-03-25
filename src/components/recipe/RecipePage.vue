<template>
    <div class="flex overflow-hidden flex-col min-h-full">
        <div class="flex relative justify-center items-end w-full h-52 md:h-80 recipe-details--header">
            <slot name="image">
                <RecipeImage :url="recipe?.imageUrl" class="absolute inset-0" />
            </slot>
            <div
                class="absolute inset-x-0 top-0 bg-gradient-to-b to-transparent from-dark-overlay recipe-details--header-overlay"
                :style="`height: ${$ui.headerHeight}px`"
            />
            <div class="flex relative justify-center pb-4 w-full mx-edge recipe-details--header-wrapper">
                <div class="flex-grow pr-36 mr-8 max-w-readable recipe-details--header-title-wrapper">
                    <slot name="title" />
                </div>
                <div class="w-72" />
            </div>
        </div>
        <div class="flex flex-grow justify-center pt-4 bg-white recipe-details--body">
            <div class="flex-grow mx-edge">
                <div class="flex flex-col justify-center md:flex-row">
                    <div class="mr-8 prose">
                        <slot name="description">
                            <BaseMarkdown v-if="recipe?.description" :text="recipe.description" />
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
                                            <BaseMarkdown :text="instructionStep.text" />
                                        </div>
                                    </li>
                                </ol>
                            </slot>
                        </template>
                        <span aria-hidden="true" class="block h-0 opacity-0">
                            This text is here just to make this div grow... If you're reading this without using some
                            developer tool, this is a bug. Please report it :).
                        </span>
                    </div>
                    <div
                        class="flex-shrink-0 w-72"
                        :style="`transform:translateY(-${metadataHeight}px)`"
                    >
                        <div class="relative">
                            <svg
                                preserveAspectRatio="none"
                                class="absolute -top-4 right-1/2 text-white translate-x-1/2 pointer-events-none fill-current recipe-page-layout--metadata-decoration"
                                viewBox="0 0 260 30"
                                :style="`height:${metadataHeight}px;width:400%`"
                            >
                                <path d="M0 30.206s71.996 1.005 83-17c11.852-19.392 84.385-15.73 94 0 11.003 18 83 17 83 17z" />
                            </svg>
                            <div class="relative">
                                <slot name="metadata">
                                    <table v-if="recipe?.servings || recipe?.prepTime || recipe?.cookTime" class="w-full">
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
                                </slot>
                            </div>
                        </div>
                        <div class="mt-12">
                            <slot name="urls">
                                <ul v-if="externalUrls.length > 0" class="mb-4">
                                    <li v-for="(externalUrl, index) of externalUrls" :key="index">
                                        <BaseLink :url="externalUrl.url" class="flex items-center space-x-1 underline">
                                            <i-zondicons-link class="w-4 h-4" aria-hidden="true" />
                                            <span>{{ $t('recipes.externalUrl', { domain: externalUrl.domain }) }}</span>
                                        </BaseLink>
                                    </li>
                                </ul>
                            </slot>
                            <slot name="actions" />
                        </div>
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
