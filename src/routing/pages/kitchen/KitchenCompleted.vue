<template>
    <KitchenPage :title="$t('kitchen.completed.title')">
        <template v-if="recipe.imageUrl">
            <RecipeImage :recipe="recipe" class="mt-3 rounded-lg w-full aspect-video" />
            <CoreMarkdown :text="$t('kitchen.completed.imageDescription')" class="text-gray-700 mt-3" />
        </template>

        <CoreMarkdown v-else :text="$t('kitchen.completed.imageMissingDescription')" class="text-gray-700 mt-3" />

        <CoreButton class="mt-4" route="recipes.show" :route-params="{ recipe: recipe.slug }">
            <i-zondicons-checkmark class="w-4 h-4" aria-hidden="true" />
            <span class="ml-1">{{ $t('kitchen.completed.finish') }}</span>
        </CoreButton>
    </KitchenPage>
</template>

<script setup lang="ts">
import { requiredObjectProp } from '@/framework/utils/vue';

import type Recipe from '@/models/Recipe';

defineProps({
    recipe: requiredObjectProp<Recipe>(),
});
</script>
