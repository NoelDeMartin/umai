<template>
    <div ref="root" :class="['relative', inline && 'inline']">
        <span :class="fillerClasses" :style="modelValue ? '' : `min-width: ${minWidth}px;`">
            {{ fillerContent }}
        </span>
        <input
            ref="input"
            :class="[
                'absolute bottom-0 left-0 w-full border-b-2 border-transparent caret-primary-500',
                'focus:border-primary-600 hover:border-gray-300 focus:outline-none',
                inline ? 'py-1' : 'py-2',
                isNumber && 'show-spinners',
            ]"
            :style="inline ? 'margin-bottom:calc(-.25rem + -2px)' : ''"
            type="text"
            v-bind="$attrs"
            :value="modelValue"
            @change="$emit('change')"
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
const { modelValue, inline } = defineProps({
    modelValue: {
        type: [String, Number],
        required: true,
    },
    inline: {
        type: Boolean,
        default: false,
    },
});
defineEmits(['update:modelValue', 'change']);

const attrs = useAttrs();
const root = $ref<HTMLInputElement>();
const input = $ref<HTMLInputElement>();
const isNumber = $computed(() => attrs.type === 'number');
const fillerClasses = $computed(
    () => [
        'invisible whitespace-pre border-b-2',
        (inline ? 'inline py-1' : 'block py-2'),
        (isNumber ? 'pr-5' : ''),
        (attrs.class ?? ''),
    ].join(' '),
);
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
