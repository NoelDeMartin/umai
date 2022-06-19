<template>
    <RecipePage
        v-element-transitions="{
            name: 'recipe-details',
            id: recipe.url,
            transitions: {
                enter: enterTransition,
                leave: {
                    'recipes.edit': $elementTransitions.fadeOut,
                },
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
            <div class="space-x-2 space-x-reverse flex flex-row-reverse justify-start w-full">
                <CoreButton
                    secondary
                    class="h-12"
                    route="recipes.edit"
                    :route-params="{ recipe: recipe.uuid }"
                >
                    <i-pepicons-pen class="ml-2 w-4 h-4" aria-hidden="true" />
                    <span class="mx-2 uppercase tracking-wider font-semibold text-sm">{{ $t('recipes.edit') }}</span>
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
import type { PropType } from 'vue';

import ShareRecipeModal from '@/components/modals/ShareRecipeModal.vue';
import type Recipe from '@/models/Recipe';

import { enterTransition, transitionToCard } from './RecipeDetails.transitions';

const { recipe } = defineProps({
    recipe: {
        type: Object as PropType<Recipe>,
        required: true,
    },
});
</script>
