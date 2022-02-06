<template>
    <transition-group
        tag="ul"
        enter-active-class="transition-all duration-300"
        enter-from-class="opacity-0"
        leave-active-class="!absolute transition-all duration-300"
        leave-to-class="opacity-0"
        move-class="transition-all duration-300"
        class="grid grid-cols-1 gap-3 my-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        @before-leave="element => $elementTransitions.freezeInPlace(element as HTMLElement)"
    >
        <RecipeCard
            v-for="recipe in recipes"
            :key="recipe.url"
            :recipe="recipe"
        />
    </transition-group>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from 'vue';
import type { PropType } from 'vue';

import { updateElement } from '@/framework/utils/dom';

import type Recipe from '@/models/Recipe';

const root = $ref<HTMLElement>();

defineProps({
    recipes: {
        type: Object as PropType<Recipe[]>,
        required: true,
    },
});

onBeforeUnmount(() => {
    if (!root)
        return;

    updateElement(root, { boundingDimensions: root.getBoundingClientRect() });
});
</script>
