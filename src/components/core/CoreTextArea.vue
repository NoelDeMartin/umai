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
        <div ref="$wrapper" class="relative w-full">
            <HeadlessInputLabel v-if="label" class="sr-only">
                {{ label }}
            </HeadlessInputLabel>
            <HeadlessInputTextArea
                class="w-full px-1.5 py-2.5 rounded border focus:outline-none hover:border-primary-500 focus:border-primary-500 focus:shadow-primary-500"
                :class="{ 'border-red-500': hasErrors }"
                v-bind="$attrs"
            />
            <HeadlessInputError class="mt-1 text-sm text-red-700 opacity-75" />
        </div>
    </HeadlessInput>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { stringProp } from '@/framework/utils/vue';
import { focusable } from '@/framework/components/headless';
import type IHeadlessInput from '@/framework/components/headless/HeadlessInput';
import type { IFocusable } from '@/framework/components/headless';

export default defineComponent({ inheritAttrs: false });
</script>

<script setup lang="ts">
defineProps({
    name: stringProp(),
    label: stringProp(),
    placeholder: stringProp(),
    modelValue: stringProp(),
    error: stringProp(),
});
defineEmits(['update:modelValue']);

const $root = $ref<IHeadlessInput<string> | null>(null);
const $wrapper = $ref<HTMLDivElement | null>(null);

defineExpose<IFocusable>({
    ...focusable($$($root)),

    getRootElement() {
        return $wrapper;
    },
});
</script>
