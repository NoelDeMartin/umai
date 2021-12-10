<template>
    <main
        aria-labelledby="#recipe-details-title"
        class="w-full"
        :style="`margin-top: -${$ui.headerHeight}px`"
    >
        <RecipeDetails v-if="recipe" :recipe="recipe" />
    </main>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';

import type Recipe from '@/models/Recipe';

defineProps({
    recipe: {
        type: Object as PropType<Recipe>,
        required: true,
    },
});
</script>
