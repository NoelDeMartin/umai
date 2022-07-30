<template>
    <HeadlessInput
        ref="$root"
        v-slot="{ hasErrors }"
        :name="name"
        :placeholder="placeholder"
        :model-value="modelValue"
        :error="error"
        :initial-focus="initialFocus"
        @update:modelValue="$emit('update:modelValue', $event)"
    >
        <div ref="$wrapper" class="relative w-full">
            <HeadlessInputLabel v-if="label" class="sr-only">
                {{ label }}
            </HeadlessInputLabel>
            <span ref="$filler" :class="fillerClasses">
                {{ fillerContent }}
            </span>
            <HeadlessInputTextArea
                v-bind="$attrs"
                :rows="rows"
                class="block w-full resize-none border-b-2 caret-primary-500 focus:outline-none"
                :class="
                    hasErrors
                        ? 'border-red-500 hover:border-primary-600 focus:border-primary-600'
                        : 'border-gray-300 md:border-transparent md:hover:border-gray-300 focus:border-primary-600'
                "
            />
            <HeadlessInputError class="mt-1 text-sm text-left text-red-700 opacity-75" />
        </div>
    </HeadlessInput>
</template>

<script lang="ts">
import { defineComponent, nextTick, useAttrs, watch } from 'vue';

import { booleanProp, stringProp } from '@/framework/utils/vue';
import { focusable } from '@/framework/components/headless';
import type IHeadlessInput from '@/framework/components/headless/HeadlessInput';
import type { IFocusable } from '@/framework/components/headless';

export default defineComponent({ inheritAttrs: false });
</script>

<script setup lang="ts">
const { placeholder } = defineProps({
    name: stringProp(),
    label: stringProp(),
    placeholder: stringProp(),
    modelValue: stringProp(),
    error: stringProp(),
    initialFocus: booleanProp(),
});
defineEmits(['update:modelValue']);

const $root = $ref<IHeadlessInput<string> | null>(null);
const $wrapper = $ref<HTMLDivElement | null>(null);
const $filler = $ref<HTMLElement | null>(null);

let rows = $ref(1);
const attrs = useAttrs();
const fillerContent = $computed(() => $root?.value?.endsWith('\n') ? $root?.value + '\n' : $root?.value);
const fillerClasses = $computed(() => 'invisible absolute w-full whitespace-pre-wrap ' + (attrs.class ?? ''));
const lineHeight = $computed(() => {
    if (!$filler)
        return 0;

    const lineHeight = document.defaultView?.getComputedStyle($filler, null).lineHeight;

    return lineHeight ? parseInt(lineHeight) : 0;
});

watch(() => [$root?.value, lineHeight], async () => {
    await nextTick();

    rows = $filler
        ? Math.max(1, Math.round($filler.offsetHeight / lineHeight))
        : 1;
});

defineExpose<IFocusable>({
    ...focusable($$($root)),

    getRootElement() {
        return $wrapper;
    },
});
</script>
