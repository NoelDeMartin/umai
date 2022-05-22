<template>
    <div class="relative">
        <label v-if="label" :for="id" class="sr-only">
            {{ label }}
        </label>
        <span ref="filler" :class="fillerClasses">
            {{ fillerContent }}
        </span>
        <textarea
            :id="id"
            ref="textArea"
            v-bind="$attrs"
            :rows="rows"
            :value="modelValue"
            class="block w-full resize-none border-b-2 border-transparent caret-primary-500 hover:border-gray-300 focus:border-primary-600 focus:outline-none"
            @input="$emit('update:modelValue', textArea?.value)"
        />
    </div>
</template>

<script lang="ts">
import { uuid } from '@noeldemartin/utils';
import { defineComponent, nextTick, useAttrs, watch } from 'vue';

import { requiredStringProp, stringProp } from '@/framework/utils/vue';

import type IBaseFluidTextArea from './BaseFluidTextArea';

export default defineComponent({ inheritAttrs: false });
</script>

<script setup lang="ts">
const { modelValue } = defineProps({
    modelValue: requiredStringProp(),
    label: stringProp(),
});
defineEmits(['update:modelValue']);

let rows = $ref(1);
const id = uuid();
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
