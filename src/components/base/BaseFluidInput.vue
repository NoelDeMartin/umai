<template>
    <div ref="root" class="relative">
        <span :class="fillerClasses" :style="modelValue ? '' : `min-width: ${minWidth}px;`">
            {{ fillerContent }}
        </span>
        <input
            ref="input"
            class="absolute bottom-0 left-0 py-2 w-full border-b-2 border-transparent caret-primary-500 focus:border-primary-600 hover:border-gray-300 focus:outline-none"
            type="text"
            v-bind="$attrs"
            :value="modelValue"
            @input="$emit('update:modelValue', input?.value)"
        >
    </div>
</template>

<script lang="ts">
import { defineComponent, useAttrs } from 'vue';

import { measureHTMLDimensions } from '@/framework/utils/dom';

import type IBaseFluidInput from './BaseFluidInput';

export default defineComponent({ inheritAttrs: false });
</script>

<script setup lang="ts">
const { modelValue } = defineProps({
    modelValue: {
        type: String,
        required: true,
    },
});
defineEmits(['update:modelValue']);

const attrs = useAttrs();
const root = $ref<HTMLInputElement>();
const input = $ref<HTMLInputElement>();
const fillerClasses = $computed(() => 'block invisible py-2 whitespace-pre border-b-2 ' + (attrs.class ?? ''));
const fillerContent = $computed(() => modelValue || ' ');
const minWidth = $computed(() => {
    if (!attrs.placeholder)
        return 60;

    return measureHTMLDimensions(`<span class="${fillerClasses}">${attrs.placeholder}</span>`).width;
});

defineExpose<IBaseFluidInput>({
    get root() { return root; },
    get minWidth() { return minWidth; },
    blur: () => input?.blur(),
    focus: () => input?.focus(),
    isFocused: () => !!input?.matches(':focus'),
});
</script>
