<template>
    <KitchenPage
        :recipe="recipe"
        :title="$t('kitchen.ingredients.title')"
        :show-kitchen-shortcut="false"
        :show-timers-shortcut="hasRunningTimers"
        :show-ingredients-shortcut="false"
    >
        <CoreMarkdown :text="$t('kitchen.ingredients.description')" class="text-gray-500 mt-1" />

        <ul class="space-y-2 mt-6 flex flex-col items-start flex-grow">
            <li v-for="(ingredient, index) of recipe.sortedIngredients" :key="index">
                <label class="flex items-center space-x-2">
                    <BaseCheckbox
                        :model-value="dish?.ingredients[ingredient]"
                        class="w-5 h-5"
                        @update:modelValue="dish?.updateIngredient(ingredient, $event)"
                    />
                    <CoreMarkdown inline :text="ingredient" />
                </label>
            </li>
        </ul>

        <div class="flex w-full justify-end space-x-2 mt-3">
            <CoreButton v-if="$kitchen.dishes.length > 1" route="kitchen">
                <i-pepicons-arrow-left class="w-4 h-4" aria-hidden="true" />
                <span class="ml-1">{{ $t('kitchen.previous') }}</span>
            </CoreButton>
            <CoreButton route="kitchen.instructions" :route-params="{ recipe: recipe.slug, step: 1 }">
                <span class="mr-1">{{ $t('kitchen.next') }}</span>
                <i-pepicons-arrow-right class="w-4 h-4" aria-hidden="true" />
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
const hasRunningTimers = computed(() => Kitchen.timers.some(timer => timer.isRunning()));
const dish = computed(() => Kitchen.findDish(props.recipe));

onMounted(() => dish.value?.updateStage('ingredients'));
</script>
