<template>
    <HeadlessInput
        ref="$root"
        :name="name"
        :placeholder="placeholder"
        :model-value="modelValue"
        :error="error"
        @update:modelValue="$emit('update:modelValue', $event)"
    >
        <div
            ref="$wrapper"
            class="relative overflow-hidden"
            :class="`${wrapperClass} ${inline ? 'inline-block' : ''}`"
        >
            <HeadlessInputLabel v-if="label" class="sr-only">
                {{ label }}
            </HeadlessInputLabel>
            <span :class="fillerClasses" :style="modelValue ? '' : `min-width: ${minWidth}px;`">
                {{ fillerContent }}
            </span>
            <HeadlessInputInput
                class="fluid-input absolute inset-0 w-full text-gray-900 border-b-2 hover:border-gray-300 focus:outline-none"
                :class="inputClasses"
                v-bind="$attrs"
            />
            <HeadlessInputError class="mt-4 text-left text-sm text-red-700 opacity-75" />
        </div>
    </HeadlessInput>
</template>

<script lang="ts">
import { arrayFilter } from '@noeldemartin/utils';
import { defineComponent, useAttrs } from 'vue';

import { measureHTMLDimensions } from '@/framework/utils/dom';
import { booleanProp, enumProp, mixedProp, stringProp } from '@/framework/utils/vue';
import { focusable } from '@/framework/components/headless/';
import type IHeadlessInput from '@/framework/components/headless/HeadlessInput';

import { CoreColor } from '@/components/core';

import type ICoreFluidInput from './CoreFluidInput';

export default defineComponent({ inheritAttrs: false });
</script>

<script setup lang="ts">
const { placeholder, inline, color } = defineProps({
    name: stringProp(),
    label: stringProp(),
    placeholder: stringProp(),
    modelValue: mixedProp<string | number>([String, Number]),
    error: stringProp(),
    wrapperClass: stringProp(''),
    inline: booleanProp(),
    color: enumProp(CoreColor),
});

defineEmits(['update:modelValue']);

interface ColorClasses {
    base: string;
    withErrors: string;
}

const colorsClasses: Record<CoreColor, ColorClasses> = {
    [CoreColor.Primary]: {
        base: 'caret-primary-500 focus:border-primary-600',
        withErrors: 'hover:border-primary-600',
    },
    [CoreColor.Solid]: {
        base: 'caret-brand-solid-500 focus:border-brand-solid-600',
        withErrors: 'hover:border-brand-solid-600',
    },
    [CoreColor.Danger]: {
        base: 'caret-red-500 focus:border-red-600',
        withErrors: 'hover:border-red-600',
    },
};
const $root = $ref<IHeadlessInput | null>(null);
const $wrapper = $ref<HTMLElement | null>(null);
const attrs = useAttrs();
const isNumber = $computed(() => attrs.type === 'number');
const fillerClasses = $computed(
    () => arrayFilter([
        'invisible whitespace-pre border-b-2',
        isNumber && 'pr-5',
        inline ? 'inline-block py-1' : 'block py-2',
        attrs.class ?? '',
    ]).join(' '),
);
const inputClasses = $computed(() => {
    const colorClasses = colorsClasses[color];

    return arrayFilter([
        colorClasses.base,
        isNumber && 'show-spinners',
        $root?.hasErrors
            ? `border-red-500 ${colorClasses.withErrors}`
            : 'border-gray-300 md:border-transparent md:hover:border-gray-300',
        inline ? 'py-1' : 'py-2',
    ]).join(' ');
});
const fillerContent = $computed(() => $root?.value || placeholder || ' ');
const minWidth = $computed(() => {
    if (!placeholder)
        return 60;

    return measureHTMLDimensions(`<span class="${fillerClasses}">${placeholder}</span>`).width;
});

defineExpose<ICoreFluidInput>({
    ...focusable($$($root)),

    get minWidth() {
        return minWidth;
    },
    getRootElement() {
        return $wrapper;
    },
});
</script>

<style>
input.fluid-input[type="search"]::-webkit-search-cancel-button {
  display: none;
}
</style>
