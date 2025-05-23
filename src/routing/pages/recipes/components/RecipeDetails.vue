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
                    'kitchen': () => after({ ms: KITCHEN_TRANSITION_DURATION }),
                    'kitchen.instructions': () => after({ ms: KITCHEN_TRANSITION_DURATION }),
                    'kitchen.ingredients': () => after({ ms: KITCHEN_TRANSITION_DURATION }),
                    'kitchen.completed': () => after({ ms: KITCHEN_TRANSITION_DURATION }),
                },
                'recipe-card': transitionToCard,
            },
        }"
        :recipe="recipe"
    >
        <template #title>
            <RecipeTitle id="recipe-details-title" :recipe="recipe" />
        </template>

        <template #actions>
            <div class="space-y-2 flex flex-col items-end w-full">
                <CoreButton
                    secondary
                    class="h-12 w-full"
                    @click="$kitchen.cook(recipe, servings)"
                >
                    <i-tabler-chef-hat-filled class="w-5 h-5 ml-2" aria-hidden="true" />
                    <span class="mx-2 uppercase tracking-wider font-semibold text-sm">{{ $t('recipes.cook') }}</span>
                </CoreButton>
                <CoreButton
                    secondary
                    class="h-12 w-full"
                    @click="editRecipe"
                >
                    <i-pepicons-pen class="ml-2 w-4 h-4" aria-hidden="true" />
                    <span class="mx-2 uppercase tracking-wider font-semibold text-sm">{{ $t('recipes.edit') }}</span>
                </CoreButton>
                <CoreButton
                    secondary
                    class="h-12 w-full"
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
import { after } from '@noeldemartin/utils';
import { onMounted, ref } from 'vue';

import Router from '@/framework/core/facades/Router';
import { requiredObjectProp } from '@/framework/utils/vue';
import { useEvent } from '@/framework/utils/composition/events';

import ShareRecipeModal from '@/components/modals/ShareRecipeModal.vue';
import { KITCHEN_TRANSITION_DURATION } from '@/routing/pages/kitchen/constants';
import type IRecipePage from '@/components/recipe/RecipePage';
import type Recipe from '@/models/Recipe';

import { enterTransition, transitionToCard } from './RecipeDetails.transitions';

const { recipe } = defineProps({
    recipe: requiredObjectProp<Recipe>(),
});

const $page = $ref<IRecipePage | null>(null);
const servings = ref(recipe.servingsBreakdown?.quantity ?? 1);

async function editRecipe() {
    await $page?.showPrimaryPanel();
    await Router.push(recipe.route('edit'));
}

useEvent('recipe-servings-updated', (recipeServings) => servings.value = recipeServings);

onMounted(() => window.scrollTo({ top: 0 }));
</script>
