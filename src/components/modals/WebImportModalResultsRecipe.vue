<template>
    <div
        class="flex overflow-hidden rounded-lg border-gray-200 shadow cursor-pointer focus:outline-none"
        :class="wrapperClasses"
    >
        <div class="relative">
            <RecipeImage :url="recipe.imageUrl" class="w-40 h-40" />
            <slot name="image" />
        </div>
        <div class="p-4 h-40 prose relative">
            <slot name="name">
                <h3>{{ recipe.name }}</h3>
            </slot>
            <div v-if="recipe.description" class="mt-1">
                <slot name="description">
                    <p>{{ recipe.description }}</p>
                </slot>
            </div>
            <div
                class="absolute w-full bottom-0 bg-gradient-to-t to-transparent h-12 pointer-events-none"
                :class="coverClasses"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { requiredObjectProp, stringProp } from '@/framework/utils/vue';

import type Recipe from '@/models/Recipe';

defineProps({
    recipe: requiredObjectProp<Recipe>(),
    wrapperClasses: stringProp('bg-gray-100'),
    coverClasses: stringProp('from-gray-100'),
});
</script>
