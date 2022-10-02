<template>
    <transition-group
        tag="ul"
        :enter-active-class="$ui.animations ? 'transition-all duration-300' : ''"
        enter-from-class="opacity-0"
        :leave-active-class="$ui.animations ? '!absolute transition-all duration-300' : ''"
        leave-to-class="opacity-0"
        :move-class="$ui.animations ? 'transition-all duration-300' : ''"
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

import { requiredArrayProp } from '@/framework/utils/vue';

import type Recipe from '@/models/Recipe';

const root = $ref<HTMLElement>();

defineProps({
    recipes: requiredArrayProp<Recipe>(),
});

onBeforeUnmount(() => {
    if (!root)
        return;

    const boundingRect = root.getBoundingClientRect();

    root.style.width = `${boundingRect.width}px`;
    root.style.height = `${boundingRect.height}px`;
});
</script>
