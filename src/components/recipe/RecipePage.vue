<template>
    <div class="flex min-h-full flex-col overflow-hidden">
        <div
            class="recipe-details--header relative flex h-52 w-full items-end justify-center md:h-80"
        >
            <slot name="image">
                <RecipeImage :url="recipe?.imageUrl" class="absolute inset-0" />
            </slot>
            <div
                class="recipe-details--header-overlay absolute inset-x-0 top-0 bg-gradient-to-b from-dark-overlay to-transparent"
                :style="`height: ${$ui.headerHeight}px`"
            />
            <div
                class="recipe-details--header-wrapper relative mx-edge flex w-full justify-center pb-4"
            >
                <div
                    class="recipe-details--header-title-wrapper mr-8 max-w-readable flex-grow pr-36"
                >
                    <slot name="title" />
                </div>
                <div class="w-72" />
            </div>
        </div>
        <div
            class="recipe-details--body flex flex-grow justify-center bg-white pt-4"
        >
            <div class="mx-edge flex-grow">
                <div class="flex flex-col justify-center md:flex-row">
                    <div class="prose mr-8">
                        <slot name="description">
                            <BaseMarkdown
                                v-if="recipe?.description"
                                :text="recipe.description"
                            />
                        </slot>
                        <template
                            v-if="$slots.ingredients || ingredients.length > 0"
                        >
                            <h2>{{ $t('recipes.ingredients') }}</h2>
                            <slot name="ingredients">
                                <div
                                    v-if="ingredients.length > 0"
                                    class="not-prose"
                                >
                                    <ul class="text-gray-700">
                                        <li
                                            v-for="(
                                                ingredient, index
                                            ) of ingredients"
                                            :key="index"
                                            class="my-2 flex items-center"
                                        >
                                            <span
                                                class="flex w-8 items-center justify-center"
                                            >
                                                <span
                                                    class="h-2 w-2 rounded-full bg-gray-300"
                                                />
                                            </span>
                                            <span
                                                class="border-b-2 border-transparent"
                                            >
                                                {{ ingredient }}
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </slot>
                        </template>
                        <template
                            v-if="
                                $slots.instructions || instructions.length > 0
                            "
                        >
                            <h2>{{ $t('recipes.instructions') }}</h2>
                            <slot name="instructions">
                                <ol
                                    v-if="
                                        recipe &&
                                            recipe.instructionSteps.length > 0
                                    "
                                    class="list-none pl-0"
                                >
                                    <li
                                        v-for="(
                                            instructionStep, index
                                        ) of instructions"
                                        :key="instructionStep.position"
                                    >
                                        <div class="flex">
                                            <span
                                                class="flex min-w-clickable justify-center text-lg font-semibold text-primary-600"
                                                aria-hidden="true"
                                            >
                                                {{ index + 1 }}.
                                            </span>
                                            <BaseMarkdown
                                                :text="instructionStep.text"
                                            />
                                        </div>
                                    </li>
                                </ol>
                            </slot>
                        </template>
                        <span aria-hidden="true" class="block h-0 opacity-0">
                            This text is here just to make this div grow... If
                            you're reading this without using some developer
                            tool, this is a bug. Please report it :).
                        </span>
                    </div>
                    <div
                        class="w-72 flex-shrink-0"
                        :style="`transform:translateY(-${metadataHeight}px)`"
                    >
                        <div class="relative">
                            <svg
                                preserveAspectRatio="none"
                                class="recipe-page-layout--metadata-decoration pointer-events-none absolute -top-4 right-1/2 translate-x-1/2 fill-current text-white"
                                viewBox="0 0 260 30"
                                :style="`height:${metadataHeight}px;width:400%`"
                            >
                                <path
                                    d="M0 30.206s71.996 1.005 83-17c11.852-19.392 84.385-15.73 94 0 11.003 18 83 17 83 17z"
                                />
                            </svg>
                            <div class="relative">
                                <slot name="metadata">
                                    <table
                                        v-if="
                                            recipe?.servings ||
                                                recipe?.prepTime ||
                                                recipe?.cookTime
                                        "
                                        class="w-full"
                                    >
                                        <tr v-if="recipe.servings" class="h-10">
                                            <th>
                                                <div
                                                    class="flex items-center space-x-2"
                                                >
                                                    <i-zondicons-location-food
                                                        class="h-3 w-3"
                                                    />
                                                    <span>{{
                                                        $t('recipes.servings')
                                                    }}</span>
                                                </div>
                                            </th>
                                            <td>{{ recipe.servings }}</td>
                                        </tr>
                                        <tr v-if="recipe.prepTime" class="h-10">
                                            <th>
                                                <div
                                                    class="flex items-center space-x-2"
                                                >
                                                    <i-zondicons-hour-glass
                                                        class="h-3 w-3"
                                                    />
                                                    <span>{{
                                                        $t('recipes.prepTime')
                                                    }}</span>
                                                </div>
                                            </th>
                                            <td>{{ recipe.prepTime }}</td>
                                        </tr>
                                        <tr v-if="recipe.cookTime" class="h-10">
                                            <th>
                                                <div
                                                    class="flex items-center space-x-2"
                                                >
                                                    <i-zondicons-time
                                                        class="h-3 w-3"
                                                    />
                                                    <span>{{
                                                        $t('recipes.cookTime')
                                                    }}</span>
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
                                    <li
                                        v-for="(
                                            externalUrl, index
                                        ) of externalUrls"
                                        :key="index"
                                    >
                                        <BaseLink
                                            :url="externalUrl.url"
                                            class="flex items-center space-x-1 underline"
                                        >
                                            <i-zondicons-link
                                                class="h-4 w-4"
                                                aria-hidden="true"
                                            />
                                            <span>{{
                                                $t('recipes.externalUrl', {
                                                    domain: externalUrl.domain,
                                                })
                                            }}</span>
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

const metadataRows = $computed(() =>
    recipe
        ? arrayFilter([recipe.servings, recipe.prepTime, recipe.cookTime])
            .length
        : 3);
const metadataHeight = $computed(() =>
    metadataRows
        ? metadataRows * TailwindCSS.pixels('spacing.10') +
          2 * TailwindCSS.pixels('spacing.4')
        : 0);

const ingredients = $computed(() => recipe?.sortedIngredients ?? []);
const instructions = $computed(() =>
    arraySorted(recipe?.instructions ?? [], 'position'));
const externalUrls = $computed(() =>
    (recipe?.sortedExternalUrls ?? []).map(url => ({
        url,
        domain: urlParse(url)?.domain?.replace(/^www\./, ''),
    })));
</script>
