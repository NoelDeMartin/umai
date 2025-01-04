<template>
    <KitchenPage :recipe="recipe" :title="$t('kitchen.completed.title')">
        <template v-if="recipe.imageUrl">
            <RecipeImage :recipe="recipe" class="mt-3 rounded-lg w-full aspect-video" />
            <CoreMarkdown :text="$t('kitchen.completed.imageDescription')" class="text-gray-700 mt-3 flex-grow" />
        </template>

        <CoreMarkdown v-else :text="$t('kitchen.completed.imageMissingDescription')" class="text-gray-700 mt-3 flex-grow" />

        <div class="flex w-full justify-end space-x-2 mt-3">
            <CoreButton route="kitchen.instructions" :route-params="{ recipe: recipe.slug, step: recipe.instructions?.length || 1 }">
                <i-pepicons-arrow-left class="w-4 h-4" aria-hidden="true" />
                <span class="ml-1">{{ $t('kitchen.previous') }}</span>
            </CoreButton>
            <CoreButton @click="dish && $kitchen.complete(dish)">
                <i-zondicons-checkmark class="w-3 h-3" aria-hidden="true" />
                <span class="ml-1.5">{{ $t('kitchen.completed.finish') }}</span>
            </CoreButton>
        </div>
    </KitchenPage>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';

import { requiredObjectProp } from '@/framework/utils/vue';

import Kitchen from '@/services/facades/Kitchen';
import type Recipe from '@/models/Recipe';

const props = defineProps({ recipe: requiredObjectProp<Recipe>() });
const dish = computed(() => Kitchen.findDish(props.recipe));

onMounted(() => dish.value?.updateStage('completed'));
</script>
