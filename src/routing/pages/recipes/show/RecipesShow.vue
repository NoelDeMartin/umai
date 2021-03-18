<template>
    <div v-if="recipe" class="flex flex-col items-center justify-center flex-grow p-8 space-y-4">
        <h1 class="text-2xl">
            {{ recipe.name }}
        </h1>
        <p v-if="recipe.description" class="text-gray-700">
            {{ recipe.description }}
        </p>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import type Recipe from '@/models/Recipe';

export default defineComponent({
    props: {
        recipe: {
            type: Object as PropType<Recipe>,
            required: true,
        },
    },
});
</script>
