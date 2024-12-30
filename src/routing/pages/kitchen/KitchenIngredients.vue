<template>
    <KitchenPage :title="$t('kitchen.ingredients.title')">
        <CoreMarkdown :text="$t('kitchen.ingredients.description')" class="text-gray-700 mt-1" />

        <ul class="space-y-2 mt-6 flex flex-col items-start">
            <li v-for="(ingredient, index) of recipe.ingredients" :key="index">
                <label class="flex items-center space-x-2">
                    <BaseCheckbox class="w-5 h-5" />
                    <CoreMarkdown inline :text="ingredient" />
                </label>
            </li>
        </ul>

        <div class="flex w-full justify-end">
            <CoreButton route="kitchen.instructions" :route-params="{ recipe: recipe.slug, step: 1 }">
                <span class="mr-1">{{ $t('kitchen.next') }}</span>
                <i-pepicons-arrow-right class="w-4 h-4" aria-hidden="true" />
            </CoreButton>
        </div>
    </KitchenPage>
</template>

<script setup lang="ts">
import { requiredObjectProp } from '@/framework/utils/vue';

import type Recipe from '@/models/Recipe';

defineProps({
    recipe: requiredObjectProp<Recipe>(),
});
</script>
