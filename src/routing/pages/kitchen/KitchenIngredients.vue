<template>
    <KitchenPage :recipe="recipe" :title="$t('kitchen.ingredients.title')">
        <CoreMarkdown :text="$t('kitchen.ingredients.description')" class="text-gray-500 mt-1" />

        <ul class="space-y-2 mt-6 flex flex-col items-start flex-grow">
            <li v-for="(ingredient, index) of ingredients" :key="index">
                <label class="flex items-center space-x-2">
                    <BaseCheckbox
                        :model-value="dish?.ingredients[ingredient]"
                        class="w-5 h-5"
                        @update:modelValue="dish?.updateIngredient(ingredient, $event)"
                    />
                    <CoreMarkdown inline :text="ingredient" auto-link="recipes" />
                </label>
            </li>
        </ul>

        <div class="flex w-full justify-end mt-3">
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
import { roundIngredientQuantity } from '@/utils/ingredients';
import type Recipe from '@/models/Recipe';

const props = defineProps({ recipe: requiredObjectProp<Recipe>() });
const dish = computed(() => Kitchen.findDish(props.recipe));
const ingredients = $computed(() => {
    const ingredientsBreakdown = props.recipe?.sortedIngredientsBreakdown;
    const originalServings = props.recipe?.servingsBreakdown?.quantity;
    const servings = dish.value?.servings ?? originalServings ?? 1;
    const ingredientsMultiplier = servings / (originalServings ?? servings);

    if (!props.recipe?.servings) {
        return ingredientsBreakdown?.map(({ original }) => original) ?? [];
    }

    return ingredientsBreakdown?.map(({ quantity, original, unitMultiplier, renderQuantity }) => {
        if (!quantity) {
            return original;
        }

        return Array.isArray(quantity)
            ? renderQuantity(quantity.map(q => roundIngredientQuantity(q * ingredientsMultiplier)) as [number, number])
            : renderQuantity(roundIngredientQuantity(quantity * ingredientsMultiplier / (unitMultiplier ?? 1)));
    }) ?? [];
});

onMounted(() => dish.value?.updateStage('ingredients'));
</script>
