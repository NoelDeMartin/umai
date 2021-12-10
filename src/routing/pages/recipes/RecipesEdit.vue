<template>
    <main class="w-full" :style="`margin-top: -${$ui.headerHeight}px`" aria-labelledby="#recipe-form-title">
        <RecipeForm
            :recipe="recipe"
            @done="$router.push({ name: 'recipes.show', params: { recipe: $event.uuid } })"
            @cancel="$router.back()"
        />
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
