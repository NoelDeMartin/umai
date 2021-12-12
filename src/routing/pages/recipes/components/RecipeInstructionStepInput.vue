<template>
    <div ref="root" class="relative group">
        <BaseFluidTextArea
            ref="textArea"
            :placeholder="$t('recipes.ingredient_placeholder')"
            :name="name"
            :model-value="modelValue"
            @update:modelValue="$emit('update:modelValue', $event)"
            @focus="updateFocus"
            @blur="updateFocus"
            @keydown.enter="onEnterKeydown($event)"
        />
        <button
            ref="removeButton"
            type="button"
            :aria-label="$t('recipes.instructionStep_remove_a11y', { position })"
            :title="$t('recipes.instructionStep_remove')"
            :class="[
                'flex absolute right-0 bottom-1 justify-center items-center w-clickable h-clickable',
                'text-gray-900 bg-white rounded-full ring-inset',
                'focus:outline-none focus:opacity-100 focus-visible:ring-2 focus-visible:ring-primary-600',
                'hover:bg-gray-200 hover:opacity-100',
                'active:bg-gray-300',
                focused ? 'opacity-60' : 'opacity-0 group-hover:opacity-60',
            ]"
            @focus="updateFocus"
            @blur="updateFocus"
            @click="$emit('remove')"
        >
            <i-zondicons-trash class="w-4 h-4" aria-hidden="true" />
        </button>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

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
const emit = defineEmits(['add', 'remove', 'update:modelValue']);

const root = ref<HTMLElement>();
const textArea = ref<IBaseFluidTextArea>();
const removeButton = ref<HTMLButtonElement>();
const focused = ref(false);

function updateFocus() {
    focused.value = !!(textArea.value?.isFocused() || removeButton.value?.matches(':focus'));
}

function onEnterKeydown(event: KeyboardEvent) {
    if (event.shiftKey)
        return;

    event.preventDefault();

    emit('add');
}

defineExpose<IRecipeInstructionStepInput>({
    focus: () => textArea.value?.focus(),
    async playLeaveAnimation() {
        if (!root.value)
            return;

        await shrink(root.value);
    },
});
</script>
