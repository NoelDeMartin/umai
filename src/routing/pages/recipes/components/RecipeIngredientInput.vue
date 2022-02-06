<template>
    <div ref="root" class="flex text-gray-700 group">
        <span
            aria-hidden="true"
            class="hidden justify-center items-center text-2xl text-gray-300 w-clickable md:flex md:group-hover:hidden"
        >
            •
        </span>
        <button
            type="button"
            tabindex="-1"
            aria-hidden="true"
            :class="[
                'flex justify-center items-center text-gray-900 rounded-full opacity-50 w-clickable h-clickable',
                'hover:!opacity-100 md:hidden md:group-hover:flex',
            ]"
            :title="$t('recipes.drag')"
            @mousedown="startDragging"
            @touchstart="startDragging"
        >
            <i-carbon-drag-vertical class="w-4 h-4" />
        </button>
        <span class="sr-only">{{ $t('recipes.drag_a11y') }}</span>
        <BaseFluidInput
            ref="input"
            :placeholder="$t('recipes.instructionStep_placeholder')"
            :name="name"
            :model-value="modelValue"
            @focus="updateFocus"
            @blur="updateFocus"
            @update:modelValue="$emit('update:modelValue', $event)"
            @keydown.enter.prevent="$emit('add')"
            @keydown.ctrl.up.prevent="$emit('swapUp')"
            @keydown.ctrl.down.prevent="$emit('swapDown')"
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
import { updateElement } from '@/framework/utils/dom';

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
const emit = defineEmits([
    'add',
    'dragStart',
    'dragStop',
    'dragUpdate',
    'remove',
    'swapDown',
    'swapUp',
    'update:modelValue',
]);

let focused = $ref(false);
const root = $ref<HTMLElement>();
const input = $ref<IBaseFluidInput>();
const removeButton = $ref<HTMLButtonElement>();

function updateFocus() {
    focused = !!(input?.isFocused() || removeButton?.matches(':focus'));
}

function startDragging(event: MouseEvent | TouchEvent) {
    const onMove = (event: MouseEvent | TouchEvent) => {
        event.preventDefault();

        emit('dragUpdate', event);
    };
    const onRelease = (event: MouseEvent | TouchEvent) => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('mouseup', onRelease);
        document.removeEventListener('touchend', onRelease);

        event.preventDefault();

        emit('dragStop', event);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove);
    document.addEventListener('mouseup', onRelease);
    document.addEventListener('touchend', onRelease);

    event.preventDefault();

    emit('dragStart', event);
}

defineExpose<IRecipeIngredientInput>({
    focus: () => input?.focus(),
    async playLeaveAnimation() {
        if (!root || !input?.root)
            return;

        const initialHeight = root.getBoundingClientRect().height;

        updateElement(input.root, {
            styles: { height: `${initialHeight}px` },
        });

        await shrink(root);
    },
});
</script>
