<template>
    <div ref="root" class="group flex text-gray-700">
        <span class="flex w-8 items-center justify-center">
            <span class="h-2 w-2 rounded-full bg-gray-300" />
        </span>
        <BaseFluidInput
            ref="input"
            :placeholder="placeholder"
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
            :aria-label="removeA11yLabel.replace(':item', modelValue)"
            :title="removeLabel"
            :class="[
                'ml-2 flex h-clickable w-clickable items-center justify-center rounded-full text-gray-900 ring-inset',
                'focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600',
                'hover:bg-gray-200 hover:opacity-100',
                'active:bg-gray-300',
                focused ? 'opacity-60' : 'opacity-0 group-hover:opacity-60',
            ]"
            @focus="updateFocus"
            @blur="updateFocus"
            @click="$emit('remove')"
        >
            <i-zondicons-trash aria-hidden="true" class="h-4 w-4" />
        </button>
    </div>
</template>

<script setup lang="ts">
import { shrink } from '@/framework/utils/transitions';

import type IBaseFluidInput from '@/components/base/BaseFluidInput';

import type IBaseInputListItem from './BaseInputListItem';

defineProps({
    modelValue: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        default: null,
    },
    placeholder: {
        type: String,
        default: 'Item...',
    },
    removeLabel: {
        type: String,
        default: 'Remove',
    },
    removeA11yLabel: {
        type: String,
        default: 'Remove ":item" item',
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

defineExpose<IBaseInputListItem>({
    focus: () => input?.focus(),
    async playLeaveAnimation() {
        if (!root || !input?.root) return;

        const initialHeight = root.getBoundingClientRect().height;

        input.root.style.height = `${initialHeight}px`;

        await shrink(root);
    },
});
</script>
