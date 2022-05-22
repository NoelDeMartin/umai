<template>
    <HeadlessInput
        v-slot="{ hasErrors }"
        ref="input"
        :name="name"
        :placeholder="placeholder"
        :model-value="modelValue"
        :error="error"
        @update:modelValue="(value: number | string | null) => $emit('update:modelValue', value)"
    >
        <HeadlessInputLabel v-if="label" class="sr-only">
            {{ label }}
        </HeadlessInputLabel>
        <HeadlessInputInput
            v-wobbly-border="wobblyBorder"
            :class="[
                'bg-gray-100 px-3 py-2 text-gray-700 focus:outline-none',
                computedClasses,
                hasErrors && 'ring-2 ring-inset ring-red-500',
            ]"
            v-bind="$attrs"
        />
        <HeadlessInputError v-if="showErrors" class="mt-1 text-sm text-red-700 opacity-75" />
    </HeadlessInput>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({ inheritAttrs: false });
</script>

<script setup lang="ts">
import { booleanProp, enumProp, mixedProp, objectProp, stringProp } from '@/framework/utils/vue';

import type { WobblyBorderOptions } from '@/directives/wobbly-border';

import { CoreColor } from './constants';
import type ICoreInput from '@/components/core/CoreInput';
import type IHeadlessInput from '@/framework/components/headless/HeadlessInput';

const { color } = defineProps({
    name: stringProp(),
    label: stringProp(),
    placeholder: stringProp(),
    color: enumProp(CoreColor),
    modelValue: mixedProp<string | number>([String, Number]),
    showErrors: booleanProp(),
    error: stringProp(),
    wobblyBorder: objectProp<WobblyBorderOptions>(),
});
defineEmits(['update:modelValue']);

const input = $ref<IHeadlessInput | null>(null);
const colorsClasses: Record<CoreColor, string> = {
    [CoreColor.Primary]: 'focus:placeholder:text-primary-500 focus:bg-primary-200',
    [CoreColor.Solid]: 'focus:placeholder:text-brand-solid-400 focus:bg-brand-solid-100',
};

const computedClasses = $computed(() => colorsClasses[color]);

defineExpose<ICoreInput>({
    focus: () => input?.focus(),
});
</script>
