<template>
    <HeadlessInput
        ref="$root"
        v-slot="{ hasErrors }"
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
                class="absolute inset-0 w-full text-gray-900 border-b-2 border-transparent caret-primary-500 focus:border-primary-600 hover:border-gray-300 focus:outline-none"
                :class="{
                    'show-spinners': isNumber,
                    'border-red-500 hover:border-primary-600 focus:border-primary-600': hasErrors,
                    'hover:border-gray-300 focus:border-primary-600': !hasErrors,
                    'py-1': inline,
                    'py-2': !inline,
                }"
                v-bind="$attrs"
            />
            <HeadlessInputError class="mt-4 text-left text-sm text-red-700 opacity-75" />
        </div>
    </HeadlessInput>
</template>

<script lang="ts">
import { defineComponent, useAttrs } from 'vue';

import { measureHTMLDimensions } from '@/framework/utils/dom';
import { booleanProp, mixedProp, stringProp } from '@/framework/utils/vue';
import { focusable } from '@/framework/components/headless/';
import type IHeadlessInput from '@/framework/components/headless/HeadlessInput';

import type ICoreFluidInput from './CoreFluidInput';

export default defineComponent({ inheritAttrs: false });
</script>

<script setup lang="ts">
const { placeholder, inline } = defineProps({
    name: stringProp(),
    label: stringProp(),
    placeholder: stringProp(),
    modelValue: mixedProp<string | number>([String, Number]),
    error: stringProp(),
    wrapperClass: stringProp(''),
    inline: booleanProp(),
});

defineEmits(['update:modelValue']);

const $root = $ref<IHeadlessInput | null>(null);
const $wrapper = $ref<HTMLElement | null>(null);
const attrs = useAttrs();
const isNumber = $computed(() => attrs.type === 'number');
const fillerClasses = $computed(
    () => [
        'invisible whitespace-pre border-b-2',
        (inline ? 'inline-block py-1' : 'block py-2'),
        (isNumber ? 'pr-5' : ''),
        (attrs.class ?? ''),
    ].join(' '),
);
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
