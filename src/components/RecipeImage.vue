<template>
    <div class="flex justify-center items-center bg-gray-200">
        <i-zondicons-photo class="w-full h-2/5 opacity-25" />
        <div
            v-if="recipe.imageUrl"
            class="absolute inset-0 bg-center bg-cover"
            :style="`background-image: url('${recipe.imageUrl}')`"
        />
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import type { PropType } from 'vue';

import type Recipe from '@/models/Recipe';

defineProps({
    recipe: {
        type: Object as PropType<Recipe>,
        required: true,
    },
});
</script>
