<template>
    <div class="relative">
        <span ref="filler" :class="fillerClasses">
            {{ fillerContent }}
        </span>
        <textarea
            ref="textArea"
            v-bind="$attrs"
            :rows="rows"
            :value="modelValue"
            class="block w-full border-b-2 border-transparent resize-none caret-primary-500 focus:border-primary-600 hover:border-gray-300 focus:outline-none"
            @input="$emit('update:modelValue', textArea?.value)"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, useAttrs, watch } from 'vue';

import type IBaseFluidTextArea from './BaseFluidTextArea';

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

let rows = $ref(1);
const attrs = useAttrs();
const textArea = $ref<HTMLTextAreaElement>();
const filler = $ref<HTMLElement>();
const fillerContent = $computed(() => modelValue.endsWith('\n') ? modelValue + '\n' : modelValue);
const fillerClasses = $computed(() => 'invisible absolute w-full whitespace-pre-wrap ' + (attrs.class ?? ''));
const lineHeight = $computed(() => {
    if (!filler)
        return 0;

    const lineHeight = document.defaultView?.getComputedStyle(filler, null).lineHeight;

    return lineHeight ? parseInt(lineHeight) : 0;
});

watch(() => [modelValue, lineHeight], async () => {
    await nextTick();

    rows = filler
        ? Math.max(1, Math.round(filler.offsetHeight / lineHeight))
        : 1;
});

defineExpose<IBaseFluidTextArea>({
    focus: () => textArea?.focus(),
    isFocused: () => !!textArea?.matches(':focus'),
});
</script>
