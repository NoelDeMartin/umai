<template>
    <RecipePage
        ref="$page"
        v-element-transitions="{
            name: 'recipe-details',
            id: recipe.url,
            transitions: {
                enter: enterTransition,
                leave: {
                    'recipes.edit': $elementTransitions.fadeOut,
                    'recipes.show': $elementTransitions.fadeOut,
                },
                'recipe-card': transitionToCard,
            },
        }"
        :recipe="recipe"
    >
        <template #title>
            <h1
                id="recipe-details-title"
                class="recipe-details--header-title text-2xl font-semibold text-white text-shadow md:text-4xl"
            >
                <span class="recipe-details--header-title-text">{{ recipe.name }}</span>
            </h1>
        </template>

        <template #actions>
            <div class="space-x-2 space-x-reverse flex flex-row-reverse justify-start w-full">
                <CoreButton
                    secondary
                    class="h-12"
                    @click="editRecipe"
                >
                    <i-pepicons-pen class="ml-2 w-4 h-4" aria-hidden="true" />
                    <span class="mx-2 uppercase tracking-wider font-semibold text-sm">{{ $t('recipes.edit') }}</span>
                </CoreButton>
                <CoreButton
                    secondary
                    class="h-12"
                    @click="print"
                >
                    <i-pepicons-file class="ml-2 w-4 h-4" aria-hidden="true" />
                    <span class="mx-2 uppercase tracking-wider font-semibold text-sm">Print</span>
                </CoreButton>
                <CoreButton
                    secondary
                    class="h-12"
                    @click="$ui.openModal(ShareRecipeModal, { recipe })"
                >
                    <i-pepicons-share-android class="w-5 h-5 ml-2" aria-hidden="true" />
                    <span class="mx-2 uppercase tracking-wider font-semibold text-sm">{{ $t('recipes.share') }}</span>
                </CoreButton>
            </div>
        </template>
    </RecipePage>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

import Router from '@/framework/core/facades/Router';
import { requiredObjectProp } from '@/framework/utils/vue';

import ShareRecipeModal from '@/components/modals/ShareRecipeModal.vue';
import { printRecipe } from '@/utils/printing.lazy';
import type IRecipePage from '@/components/recipe/RecipePage';
import type Recipe from '@/models/Recipe';

import { enterTransition, transitionToCard } from './RecipeDetails.transitions';

const { recipe } = defineProps({
    recipe: requiredObjectProp<Recipe>(),
});

const $page = $ref<IRecipePage | null>(null);

async function editRecipe() {
    await $page?.showPrimaryPanel();
    await Router.push(recipe.route('edit'));
}

async function print() {
    await printRecipe(recipe, $page?.getImage()?.getImageElement() ?? undefined);
}

onMounted(() => window.scrollTo({ top: 0 }));
</script>
