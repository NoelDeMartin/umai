<template>
    <div ref="root" :class="['relative', inline && 'inline-block']" @click="disabled || $emit('click')">
        <span v-if="disabled" class="absolute inset-0 z-10" @click="$emit('click')" />
        <span :class="fillerClasses" :style="inputValue ? '' : `min-width: ${minWidth}px;`">
            {{ fillerContent }}
        </span>
        <input
            ref="input"
            :name="name"
            :class="[
                'absolute inset-0 w-full border-b-2 border-transparent caret-primary-500',
                'focus:border-primary-600 hover:border-gray-300 focus:outline-none',
                inline ? 'py-1' : 'py-2',
                isNumber && 'show-spinners',
                disabled ? 'text-gray-600' : 'text-gray-900',
            ]"
            :style="inline ? 'margin-bottom:calc(-.25rem + -2px)' : ''"
            type="text"
            v-bind="$attrs"
            :disabled="disabled"
            :value="inputValue"
            @change="$emit('change')"
            @input="onInput()"
        >
    </div>
</template>

<script lang="ts">
import { defineComponent, inject, useAttrs } from 'vue';
import type { PropType } from 'vue';

import { measureHTMLDimensions } from '@/framework/utils/dom';
import type Form from '@/framework/forms/Form';

import type IBaseFluidInput from './BaseFluidInput';

export default defineComponent({ inheritAttrs: false });
</script>

<script setup lang="ts">
const { modelValue, name, inline, form: formProp } = defineProps({
    modelValue: {
        type: [String, Number],
        default: null,
    },
    name: {
        type: String,
        default: '',
    },
    inline: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    form: {
        type: Object as PropType<Form | null>,
        default: null,
    },
});
const emit = defineEmits(['update:modelValue', 'change', 'click']);

const form = formProp ?? inject('form', null);
const attrs = useAttrs();
const root = $ref<HTMLInputElement>();
const input = $ref<HTMLInputElement>();
const isNumber = $computed(() => attrs.type === 'number');
const fillerClasses = $computed(
    () => [
        'invisible whitespace-pre border-b-2',
        (inline ? 'inline-block py-1' : 'block py-2'),
        (isNumber ? 'pr-5' : ''),
        (attrs.class ?? ''),
    ].join(' '),
);
const formInput = $computed(() => form?.input<string>(name ?? '') ?? null);
const inputValue = $computed(() => formInput?.value ?? modelValue);
const fillerContent = $computed(() => inputValue || ' ');
const minWidth = $computed(() => {
    if (!attrs.placeholder)
        return 60;

    return measureHTMLDimensions(`<span class="${fillerClasses}">${attrs.placeholder}</span>`).width;
});

function onInput() {
    const value = input?.value;

    formInput?.update(value);

    emit('update:modelValue', value);
}

defineExpose<IBaseFluidInput>({
    get root() { return root; },
    get minWidth() { return minWidth; },
    blur: () => input?.blur(),
    focus: () => input?.focus(),
    isFocused: () => !!input?.matches(':focus'),
});
</script>
