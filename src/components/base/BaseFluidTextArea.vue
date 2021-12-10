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
import { computed, defineComponent, nextTick, ref, useAttrs, watch } from 'vue';

import type { IBaseFluidTextArea } from './BaseFluidTextArea';

export default defineComponent({ inheritAttrs: false });
</script>

<script setup lang="ts">
const props = defineProps({
    modelValue: {
        type: String,
        required: true,
    },
});
defineEmits(['update:modelValue']);

const attrs = useAttrs();
const rows = ref(1);
const textArea = ref<HTMLTextAreaElement>();
const filler = ref<HTMLElement>();
const fillerContent = computed(() => props.modelValue.endsWith('\n') ? props.modelValue + '\n' : props.modelValue);
const fillerClasses = computed(() => 'invisible absolute w-full whitespace-pre-wrap ' + (attrs.class ?? ''));
const lineHeight = computed(() => {
    if (!filler.value)
        return 0;

    const lineHeight = document.defaultView?.getComputedStyle(filler.value, null).lineHeight;

    return lineHeight ? parseInt(lineHeight) : 0;
});

watch(() => [props.modelValue, lineHeight.value], async () => {
    await nextTick();

    rows.value = filler.value
        ? Math.max(1, Math.round(filler.value.offsetHeight / lineHeight.value))
        : 1;
});

defineExpose<IBaseFluidTextArea>({
    focus: () => textArea.value?.focus(),
    isFocused: () => !!textArea.value?.matches(':focus'),
});
</script>
