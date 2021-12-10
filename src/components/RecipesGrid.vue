<template>
    <ul ref="root" class="grid grid-cols-1 gap-3 my-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <RecipeCard
            v-for="recipe in recipes"
            :key="recipe.url"
            :recipe="recipe"
        />
    </ul>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import type { FluentArray } from '@noeldemartin/utils';
import type { PropType } from 'vue';

import { updateElement } from '@/framework/utils/dom';

import type Recipe from '@/models/Recipe';

const root = ref<HTMLElement>();

defineProps({
    recipes: {
        type: Object as PropType<FluentArray<Recipe>>,
        required: true,
    },
});

onBeforeUnmount(() => {
    if (!root.value)
        return;

    updateElement(root.value, { boundingDimensions: root.value.getBoundingClientRect() });
});
</script>
