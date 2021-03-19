<template>
    <ul v-if="recipes.length > 0" class="border-b divide-y divide-gray-200 rounded-t-md">
        <li v-for="recipe of recipes" :key="recipe.id" class="flex justify-between p-4">
            <span>
                <i-twemoji-fork-and-knife class="inline w-4 h-4 mr-2" />
                <router-link
                    :to="{ name: 'recipes.show', params: { recipe: recipe.uuid } }"
                    class="text-gray-800 hover:text-indigo-700"
                >
                    {{ recipe.name }}
                </router-link>
            </span>
            <div class="flex space-x-2">
                <button type="button" title="Remove" @click="$cookbook.removeRecipe(recipe)">
                    <i-zondicons-trash class="w-4 h-4 text-gray-500 opacity-30 hover:opacity-100 hover:text-red-500" />
                </button>
                <router-link :to="{ name: 'recipes.edit', params: { recipe: recipe.uuid } }" title="Edit">
                    <i-zondicons-edit-pencil class="w-4 h-4 text-gray-500 opacity-30 hover:opacity-100 hover:text-gray-800" />
                </router-link>
            </div>
        </li>
    </ul>
    <div v-else class="p-8 text-center">
        <p class="text-xl font-thin">
            <i-twemoji-fork-and-knife class="inline w-8 h-8" /> No recipes yet!
        </p>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { FluentArray } from '@noeldemartin/utils';
import type { PropType } from 'vue';

import type Recipe from '@/models/Recipe';

export default defineComponent({
    props: {
        recipes: {
            type: Object as PropType<FluentArray<Recipe>>,
            required: true,
        },
    },
});
</script>
