<template>
    <AppPage
        style="margin-top: calc(-1 * var(--header-height))"
        aria-labelledby="recipe-details-title"
    >
        <RecipeDetails :recipe="recipe" />
    </AppPage>
</template>

<script setup lang="ts">
import { requiredObjectProp } from '@/framework/utils/vue';

import type Recipe from '@/models/Recipe';

defineProps({
    recipe: requiredObjectProp<Recipe>(),
});
</script>
