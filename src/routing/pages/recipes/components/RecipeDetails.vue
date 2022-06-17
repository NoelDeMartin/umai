<template>
    <RecipePage
        v-element-transitions="{
            name: 'recipe-details',
            id: recipe.url,
            transitions: {
                enter: enterTransition,
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
            <StrokeButton class="w-full" route="recipes.edit" :route-params="{ recipe: recipe.uuid }">
                <i-zondicons-edit-pencil class="mr-2 w-4 h-4" /> {{ $t('recipes.edit') }}
            </StrokeButton>
            <StrokeButton class="mt-2 w-full" @click="$ui.openModal(ShareRecipeModal, { recipe })">
                <i-zondicons-share class="mr-2 w-4 h-4" /> {{ $t('recipes.share') }}
            </StrokeButton>
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
