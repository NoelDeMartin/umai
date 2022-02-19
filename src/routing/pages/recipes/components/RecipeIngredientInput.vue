<template>
    <div ref="root" class="flex text-gray-700 group">
        <span class="flex justify-center items-center w-8">
            <span class="w-2 h-2 bg-gray-300 rounded-full" />
        </span>
        <BaseFluidInput
            ref="input"
            :placeholder="$t('recipes.ingredient_placeholder')"
            :name="name"
            :model-value="modelValue"
            @focus="updateFocus"
            @blur="updateFocus"
            @update:modelValue="$emit('update:modelValue', $event)"
            @keydown.enter.prevent="$emit('add')"
        />
        <button
            ref="removeButton"
            type="button"
            :aria-label="$t('recipes.ingredient_remove_a11y', { ingredient: modelValue })"
            :title="$t('recipes.ingredient_remove')"
            :class="[
                'flex justify-center items-center ml-2 ring-inset text-gray-900 rounded-full w-clickable h-clickable',
                'focus:outline-none focus:opacity-100 focus-visible:ring-2 focus-visible:ring-primary-600',
                'hover:bg-gray-200 hover:opacity-100',
                'active:bg-gray-300',
                focused ? 'opacity-60' : 'opacity-0 group-hover:opacity-60',
            ]"
            @focus="updateFocus"
            @blur="updateFocus"
            @click="$emit('remove')"
        >
            <i-zondicons-trash aria-hidden="true" class="w-4 h-4" />
        </button>
    </div>
</template>

<script setup lang="ts">
import { shrink } from '@/framework/utils/transitions';

import type IBaseFluidInput from '@/components/base/BaseFluidInput';

import type IRecipeIngredientInput from './RecipeIngredientInput';

defineProps({
    modelValue: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        default: null,
    },
});

defineEmits(['add', 'remove', 'update:modelValue']);

let focused = $ref(false);
const root = $ref<HTMLElement>();
const input = $ref<IBaseFluidInput>();
const removeButton = $ref<HTMLButtonElement>();

function updateFocus() {
    focused = !!(input?.isFocused() || removeButton?.matches(':focus'));
}

defineExpose<IRecipeIngredientInput>({
    focus: () => input?.focus(),
    async playLeaveAnimation() {
        if (!root || !input?.root)
            return;

        const initialHeight = root.getBoundingClientRect().height;

        input.root.style.height = `${initialHeight}px`;

        await shrink(root);
    },
});
</script>
