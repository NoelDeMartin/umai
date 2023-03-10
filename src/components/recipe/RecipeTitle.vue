<template>
    <h1
        class="
            text-2xl font-semibold text-white text-shadow md:text-4xl
            print:text-no-shadow print:text-primary-500 print:text-5xl
        "
    >
        <span class="recipe-title--text">{{ recipe.name }}</span>
    </h1>
</template>

<script setup lang="ts">
import { requiredObjectProp } from '@/framework/utils/vue';

import type Recipe from '@/models/Recipe';

defineProps({
    recipe: requiredObjectProp<Recipe>(),
});
</script>
