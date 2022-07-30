<template>
    <main
        aria-labelledby="#recipe-details-title"
        :style="`margin-top: -${$ui.headerHeight}px`"
    >
        <RecipeDetails :recipe="recipe" />
    </main>
</template>

<script setup lang="ts">
import { requiredObjectProp } from '@/framework/utils/vue';

import type Recipe from '@/models/Recipe';

defineProps({
    recipe: requiredObjectProp<Recipe>(),
});
</script>
