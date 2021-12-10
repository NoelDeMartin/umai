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
import { computed, nextTick, onBeforeUpdate, ref } from 'vue';
import { arraySwap, arrayWithItemAt, arrayWithoutIndex, uuid } from '@noeldemartin/utils';
import type { PropType } from 'vue';

import type { IRecipeIngredientInput, RecipeIngredientInputData } from './RecipeIngredientInput';

const emit = defineEmits(['update:modelValue']);
const props = defineProps({
    modelValue: {
        type: Array as PropType<RecipeIngredientInputData[]>,
        default: [] as RecipeIngredientInputData[],
    },
});

const list = ref<HTMLElement>();
const inputs = ref<IRecipeIngredientInput[]>([]);
const ingredients = computed(() => props.modelValue);
const dragging = ref<{
    listY: number;
    currentItem: number;
    listHeight: number;
    itemHeight: number;
}>();

onBeforeUpdate(() => inputs.value = []);

function startDragging(index: number) {
    if (!list.value || !list.value.firstElementChild)
        return;

    dragging.value = {
        currentItem: index,
        listY: list.value.getBoundingClientRect().y,
        listHeight: list.value.clientHeight,
        itemHeight: list.value.firstElementChild.clientHeight,
    };
}

function updateDragging(event: MouseEvent | TouchEvent) {
    if (!dragging.value)
        return;

    const pageY = 'pageY' in event ? event.pageY : event.touches[0].pageY;
    const item = Math.floor((pageY - dragging.value.listY) / dragging.value.itemHeight);

    if (item !== dragging.value.currentItem) {
        swapIngredients(dragging.value.currentItem, item, false);

        dragging.value.currentItem = item;
    }
}

function stopDragging() {
    dragging.value = undefined;
}

async function addIngredient(index: number) {
    const newIngredient: RecipeIngredientInputData = { id: uuid(), name: '' };

    emit('update:modelValue', arrayWithItemAt(ingredients.value, newIngredient, index));

    await nextTick();

    inputs.value[index + 1].focus();
}

async function swapIngredients(firstIndex: number, secondIndex: number, focus: boolean = true) {
    if (Math.max(firstIndex, secondIndex) > ingredients.value.length - 1 || Math.min(firstIndex, secondIndex) < 0)
        return;

    arraySwap(ingredients.value, firstIndex, secondIndex);

    if (!focus)
        return;

    await nextTick();

    inputs.value[secondIndex].focus();
}

async function removeIngredient(index: number) {
    inputs.value[index === 0 ? 1 : index - 1]?.focus();

    await inputs.value[index].playLeaveAnimation();

    emit('update:modelValue', arrayWithoutIndex(ingredients.value, index));
}
</script>
