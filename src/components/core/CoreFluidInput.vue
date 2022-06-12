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
        <div ref="$wrapper" class="relative">
            <HeadlessInputLabel v-if="label" class="sr-only">
                {{ label }}
            </HeadlessInputLabel>
            <span :class="fillerClasses" :style="modelValue ? '' : `min-width: ${minWidth}px;`">
                {{ fillerContent }}
            </span>
            <HeadlessInputInput
                class="absolute inset-0 w-full py-2 text-gray-900 border-b-2 border-transparent caret-primary-500 focus:border-primary-600 hover:border-gray-300 focus:outline-none"
                :class="[
                    isNumber && 'show-spinners',
                    hasErrors
                        ? 'border-red-500 hover:border-primary-600 focus:border-primary-600'
                        : 'hover:border-gray-300 focus:border-primary-600',
                ]"
                v-bind="$attrs"
            />
            <HeadlessInputError class="mt-4 text-left text-sm text-red-700 opacity-75" />
        </div>
    </HeadlessInput>
</template>

<script lang="ts">
import { defineComponent, useAttrs } from 'vue';

import { measureHTMLDimensions } from '@/framework/utils/dom';
import { mixedProp, stringProp } from '@/framework/utils/vue';
import { focusable } from '@/framework/components/headless/';
import type IHeadlessInput from '@/framework/components/headless/HeadlessInput';
import type { IFocusable } from '@/framework/components/headless/';

export default defineComponent({ inheritAttrs: false });
</script>

<script setup lang="ts">
const { placeholder } = defineProps({
    name: stringProp(),
    label: stringProp(),
    placeholder: stringProp(),
    modelValue: mixedProp<string | number>([String, Number]),
    error: stringProp(),
});

defineEmits(['update:modelValue']);

const $root = $ref<IHeadlessInput | null>(null);
const $wrapper = $ref<HTMLElement | null>(null);
const attrs = useAttrs();
const isNumber = $computed(() => attrs.type === 'number');
const fillerClasses = $computed(
    () => [
        'invisible whitespace-pre border-b-2 block py-2',
        (isNumber ? 'pr-5' : ''),
        (attrs.class ?? ''),
    ].join(' '),
);
const fillerContent = $computed(() => $root?.value || placeholder || ' ');
const minWidth = $computed(() => {
    if (!attrs.placeholder)
        return 60;

    return measureHTMLDimensions(`<span class="${fillerClasses}">${attrs.placeholder}</span>`).width;
});

defineExpose<IFocusable>({
    ...focusable($$($root)),

    getRootElement() {
        return $wrapper;
    },
});
</script>