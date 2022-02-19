<template>
    <div>
        <ul ref="list" class="mb-4">
            <transition-group move-class="transition-all duration-300">
                <li v-for="(ingredient, index) of ingredients" :key="ingredient.id">
                    <RecipeIngredientInput
                        :ref="el => el && (inputs[index] = el as unknown as IRecipeIngredientInput)"
                        v-model="ingredient.name"
                        :name="`ingredient-${ingredient.id}`"
                        @add="addIngredient(index)"
                        @remove="removeIngredient(index)"
                    />
                </li>
            </transition-group>
        </ul>
        <BaseButton @click="addIngredient(ingredients.length - 1)">
            {{ $t('recipes.ingredient_add') }}
        </BaseButton>
    </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUpdate } from 'vue';
import { arrayWithItemAt, arrayWithoutIndex, uuid } from '@noeldemartin/utils';
import type { PropType } from 'vue';

import type IRecipeIngredientInput from './RecipeIngredientInput';
import type { RecipeIngredientInputData } from './RecipeIngredientInput';

const emit = defineEmits(['update:modelValue']);
const { modelValue } = defineProps({
    modelValue: {
        type: Array as PropType<RecipeIngredientInputData[]>,
        default: [] as RecipeIngredientInputData[],
    },
});

let inputs = $ref<IRecipeIngredientInput[]>([]);
const list = $ref<HTMLElement>();
const ingredients = $computed(() => modelValue);

onBeforeUpdate(() => inputs = []);

async function addIngredient(index: number) {
    const newIngredient: RecipeIngredientInputData = { id: uuid(), name: '' };

    emit('update:modelValue', arrayWithItemAt(ingredients, newIngredient, index));

    await nextTick();

    inputs[index + 1].focus();
}

async function removeIngredient(index: number) {
    inputs[index === 0 ? 1 : index - 1]?.focus();

    await inputs[index].playLeaveAnimation();

    emit('update:modelValue', arrayWithoutIndex(ingredients, index));
}
</script>
