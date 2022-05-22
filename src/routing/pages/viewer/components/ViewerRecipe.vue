<template>
    <RecipePage :recipe="recipe">
        <template #title>
            <h1
                id="viewer-recipe-title"
                class="text-shadow text-4xl font-semibold text-white"
            >
                <span>{{ recipe.name }}</span>
            </h1>
        </template>
    </RecipePage>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';

import type Recipe from '@/models/Recipe';

const { recipe } = defineProps({
    recipe: {
        type: Object as PropType<Recipe>,
        required: true,
    },
});
</script>
