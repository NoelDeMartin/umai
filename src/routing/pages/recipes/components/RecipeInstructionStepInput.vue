<template>
    <div ref="root" class="group relative">
        <BaseFluidTextArea
            ref="textArea"
            :placeholder="$t('recipes.ingredient_placeholder')"
            :name="name"
            :model-value="modelValue"
            @update:modelValue="$emit('update:modelValue', $event)"
            @focus="updateFocus"
            @blur="updateFocus"
            @keydown.enter="onEnterKeydown($event)"
            @keydown.ctrl.up.prevent="$emit('swapUp')"
            @keydown.ctrl.down.prevent="$emit('swapDown')"
        />
        <button
            ref="removeButton"
            type="button"
            :aria-label="
                $t('recipes.instructionStep_remove_a11y', { position })
            "
            :title="$t('recipes.instructionStep_remove')"
            :class="[
                'absolute right-0 bottom-1 flex h-clickable w-clickable items-center justify-center',
                'rounded-full bg-white text-gray-900 ring-inset',
                'focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600',
                'hover:bg-gray-200 hover:opacity-100',
                'active:bg-gray-300',
                focused ? 'opacity-60' : 'opacity-0 group-hover:opacity-60',
            ]"
            @focus="updateFocus"
            @blur="updateFocus"
            @click="$emit('remove')"
        >
            <i-zondicons-trash class="h-4 w-4" aria-hidden="true" />
        </button>
    </div>
</template>

<script setup lang="ts">
import { shrink } from '@/framework/utils/transitions';

import type IBaseFluidTextArea from '@/components/base/BaseFluidTextArea';

import type IRecipeInstructionStepInput from './RecipeInstructionStepInput';

defineProps({
    modelValue: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        default: null,
    },
    position: {
        type: Number,
        default: 0,
    },
});
const emit = defineEmits([
    'add',
    'remove',
    'swapUp',
    'swapDown',
    'update:modelValue',
]);

let focused = $ref(false);
const root = $ref<HTMLElement>();
const textArea = $ref<IBaseFluidTextArea>();
const removeButton = $ref<HTMLButtonElement>();

function updateFocus() {
    focused = !!(textArea?.isFocused() || removeButton?.matches(':focus'));
}

function onEnterKeydown(event: KeyboardEvent) {
    if (event.shiftKey) return;

    event.preventDefault();

    emit('add');
}

defineExpose<IRecipeInstructionStepInput>({
    focus: () => textArea?.focus(),
    async playLeaveAnimation() {
        if (!root) return;

        await shrink(root);
    },
});
</script>
