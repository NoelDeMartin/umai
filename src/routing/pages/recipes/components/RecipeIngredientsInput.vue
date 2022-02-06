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
                        @swapUp="swapIngredients(index, index - 1)"
                        @swapDown="swapIngredients(index, index + 1)"
                        @dragStart="startDragging(index)"
                        @dragUpdate="updateDragging($event)"
                        @dragStop="stopDragging()"
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
import { arraySwap, arrayWithItemAt, arrayWithoutIndex, uuid } from '@noeldemartin/utils';
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

let dragging = $ref<{
    listY: number;
    currentItem: number;
    listHeight: number;
    itemHeight: number;
} | null>(null);
let inputs = $ref<IRecipeIngredientInput[]>([]);
const list = $ref<HTMLElement>();
const ingredients = $computed(() => modelValue);

onBeforeUpdate(() => inputs = []);

function startDragging(index: number) {
    if (!list || !list.firstElementChild)
        return;

    dragging = {
        currentItem: index,
        listY: list.getBoundingClientRect().y,
        listHeight: list.clientHeight,
        itemHeight: list.firstElementChild.clientHeight,
    };
}

function updateDragging(event: MouseEvent | TouchEvent) {
    if (!dragging)
        return;

    const pageY = 'pageY' in event ? event.pageY : event.touches[0].pageY;
    const item = Math.floor((pageY - dragging.listY) / dragging.itemHeight);

    if (item !== dragging.currentItem) {
        swapIngredients(dragging.currentItem, item, false);

        dragging.currentItem = item;
    }
}

function stopDragging() {
    dragging = null;
}

async function addIngredient(index: number) {
    const newIngredient: RecipeIngredientInputData = { id: uuid(), name: '' };

    emit('update:modelValue', arrayWithItemAt(ingredients, newIngredient, index));

    await nextTick();

    inputs[index + 1].focus();
}

async function swapIngredients(firstIndex: number, secondIndex: number, focus: boolean = true) {
    if (Math.max(firstIndex, secondIndex) > ingredients.length - 1 || Math.min(firstIndex, secondIndex) < 0)
        return;

    arraySwap(ingredients, firstIndex, secondIndex);

    if (!focus)
        return;

    await nextTick();

    inputs[secondIndex].focus();
}

async function removeIngredient(index: number) {
    inputs[index === 0 ? 1 : index - 1]?.focus();

    await inputs[index].playLeaveAnimation();

    emit('update:modelValue', arrayWithoutIndex(ingredients, index));
}
</script>
