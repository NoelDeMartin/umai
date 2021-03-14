<template>
    <ul v-if="recipes.length > 0" class="divide-y divide-gray-200 rounded-t-md">
        <li v-for="recipe of recipes" :key="recipe.id" class="flex justify-between p-4">
            <span><i-twemoji-fork-and-knife class="inline w-4 h-4" /> {{ recipe.name }}</span>
            <button type="button" title="Remove" @click="$emit('remove', recipe)">
                <i-zondicons-trash class="w-4 h-4 text-gray-500 opacity-30 hover:opacity-100 hover:text-red-500" />
            </button>
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
import type { PropType } from 'vue';

import type Recipe from '@/models/Recipe';

export default defineComponent({
    props: {
        recipes: {
            type: Array as PropType<Recipe[]>,
            required: true,
        },
    },
    emits: ['remove'],
});
</script>
