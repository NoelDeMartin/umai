<template>
    <RadioGroupOption
        v-slot="{ active, checked }"
        class="cursor-pointer focus:outline-none"
        :value="recipe"
    >
        <WebImportModalResultsRecipe
            :class="{ 'ring-2 ring-offset-2 ring-primary-600': active }"
            :wrapper-classes="checked ? 'bg-primary-gray-300' : 'bg-gray-100'"
            :cover-classes="checked ? 'from-primary-gray-300' : 'from-gray-100'"
            :recipe="recipe"
        >
            <template v-if="checked" #image>
                <div class="bg-primary-300 shadow text-primary-700 rounded-full p-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <i-pepicons-checkmark class="w-10 h-10" aria-hidden="true" />
                </div>
            </template>

            <template #name>
                <RadioGroupLabel as="h3">
                    {{ recipe.name }}
                </RadioGroupLabel>
            </template>

            <template #description>
                <RadioGroupDescription as="p">
                    {{ recipe.description }}
                </RadioGroupDescription>
            </template>
        </WebImportModalResultsRecipe>
    </RadioGroupOption>
</template>

<script setup lang="ts">
import { requiredObjectProp } from '@/framework/utils/vue';

import type Recipe from '@/models/Recipe';

defineProps({
    recipe: requiredObjectProp<Recipe>(),
});
</script>
