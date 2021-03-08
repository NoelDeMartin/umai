<template>
    <div class="flex flex-col items-center justify-center flex-grow max-w-2xl p-8 m-auto">
        <p v-if="!recipes">
            <loading-dots class="w-16 h-12 text-indigo-500" />
        </p>
        <div v-else class="w-full bg-white rounded shadow">
            <RecipesList :recipes="recipes" @remove="removeRecipe" />
            <RecipeForm ref="form" @created="addRecipe" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, onMounted, ref } from 'vue';
import { fluent } from '@noeldemartin/utils';
import type { FluentArray } from '@noeldemartin/utils';

import Recipe from '@/models/Recipe';

export default defineComponent({
    setup() {
        const recipes = ref<FluentArray<Recipe>>();
        const form = ref<{ focus(): void }>();
        const addRecipe = (recipe: Recipe) => {
            recipes.value?.push(recipe);
            form.value?.focus();
        };
        const removeRecipe = async (recipe: Recipe) => {
            await recipe.delete();

            recipes.value?.remove(recipe);
        };

        onMounted(async () => {
            recipes.value = fluent(await Recipe.all());

            await nextTick();

            form.value?.focus();
        });

        return { recipes, form, addRecipe, removeRecipe };
    },
});
</script>
