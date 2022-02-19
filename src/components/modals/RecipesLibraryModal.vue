<template>
    <AppModal v-slot="{ close }" no-padding :title="$t('recipes.library.title')">
        <div class="px-4">
            <p>{{ $t('recipes.library.description') }}</p>
        </div>
        <div class="flex overflow-hidden mt-4">
            <ul class="border-t border-gray-300">
                <li v-for="recipeName of $cookbook.libraryRecipes" :key="recipeName">
                    <button
                        type="button"
                        :class="[
                            'px-4 py-2 w-full text-left border-b border-gray-300 outline-none',
                            'hover:bg-gray-300 focus:bg-gray-300',
                            recipeName === selectedRecipe && 'bg-gray-200'
                        ]"
                        @click="selectedRecipe = recipeName"
                    >
                        {{ recipeName }}
                    </button>
                </li>
            </ul>
            <div v-if="recipe" class="flex flex-col flex-grow w-96 bg-gray-200">
                <div class="flex relative items-end w-full h-40">
                    <h3 class="relative z-10 m-4 text-3xl font-semibold text-white text-shadow">
                        {{ recipe.name }}
                    </h3>
                    <RecipeImage :url="recipe.imageUrl" class="absolute inset-0" />
                </div>
                <div class="overflow-auto flex-grow flex-shrink p-4 h-96">
                    <BaseMarkdown :text="recipe.description ?? $t('recipes.library.recipeWithoutDescription')" />
                </div>
                <BaseButton class="self-center m-4" @click="importRecipe(), close()">
                    {{ $t('recipes.library.import') }}
                </BaseButton>
            </div>
        </div>
    </AppModal>
</template>

<script setup lang="ts">
import { watchEffect } from 'vue';

import Router from '@/framework/core/facades/Router';

import Cookbook from '@/services/facades/Cookbook';
import type Recipe from '@/models/Recipe';

const selectedRecipe = $ref(Cookbook.libraryRecipes[0] ?? null);
let recipe = $ref<Recipe>();

watchEffect(async () => {
    if (!selectedRecipe)
        return;

    recipe = await Cookbook.loadFromLibrary(selectedRecipe);
});

async function importRecipe(): Promise<void> {
    await recipe.save();

    Router.push({
        name: 'recipes.show',
        params: { recipe: recipe.uuid },
    });
}
</script>
