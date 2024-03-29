<template>
    <HeadlessInput
        v-slot="{ hasErrors }"
        ref="$root"
        :name="name"
        :placeholder="placeholder"
        :model-value="modelValue"
        :error="error"
        :initial-focus="initialFocus"
        :disabled="disabled"
        @update:modelValue="$emit('update:modelValue', $event)"
    >
        <HeadlessInputLabel v-if="label" class="sr-only">
            {{ label }}
        </HeadlessInputLabel>
        <HeadlessInputInput
            v-wobbly-border="wobblyBorder"
            :class="[
                'bg-gray-100 px-3 py-2 focus:outline-none',
                computedClasses,
                disabled ? 'text-gray-400 opacity-75' : 'text-gray-700',
                hasErrors && 'ring-1 ring-inset ring-red-500',
                bordered && !hasErrors && 'ring-1 ring-inset ring-gray-300',
            ]"
            v-bind="$attrs"
        />
        <HeadlessInputError v-if="showErrors" class="mt-1 text-sm text-red-700 opacity-75" />
    </HeadlessInput>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { booleanProp, enumProp, mixedProp, objectProp, stringProp } from '@/framework/utils/vue';
import { focusable } from '@/framework/components/headless';
import type { IFocusable } from '@/framework/components/headless';

import type { WobblyBorderOptions } from '@/directives/wobbly-border';

import { CoreColor } from './index';

export default defineComponent({ inheritAttrs: false });
</script>

<script setup lang="ts">
const { color } = defineProps({
    name: stringProp(),
    label: stringProp(),
    placeholder: stringProp(),
    color: enumProp(CoreColor),
    modelValue: mixedProp<string | number>([String, Number]),
    showErrors: booleanProp(),
    error: stringProp(),
    disabled: booleanProp(),
    bordered: booleanProp(),
    wobblyBorder: objectProp<WobblyBorderOptions>(),
    initialFocus: booleanProp(),
});
defineEmits(['update:modelValue']);

const colorsClasses: Record<CoreColor, string> = {
    [CoreColor.Primary]: 'focus:placeholder:text-primary-500 focus:bg-primary-100 focus:ring-primary-500',
    [CoreColor.Solid]: 'focus:placeholder:text-brand-solid-400 focus:bg-brand-solid-100 focus:ring-brand-solid-500',
    [CoreColor.Danger]: 'focus:placeholder:text-red-400 focus:bg-red-100 focus:ring-red-500',
};
const $root = $ref<IFocusable | null>(null);
const computedClasses = $computed(() => colorsClasses[color]);

defineExpose<IFocusable>(focusable($$($root)));
</script>
