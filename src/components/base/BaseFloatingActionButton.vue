<template>
    <!-- TODO a11y -->
    <HeadlessButton
        class="flex h-clickable min-w-clickable flex-shrink-0 items-center justify-center rounded-full bg-primary-600 px-3 text-white shadow-lg hover:bg-primary-700"
        @focus="focused = true"
        @blur="focused = false"
        @mouseenter="hover = true"
        @mouseleave="hover = false"
        @click="button?.blur()"
    >
        <i-mdi-plus class="h-5 w-5" />
        <span
            ref="text"
            class="overflow-hidden whitespace-nowrap transition-[width] duration-150"
            :style="textStyles"
        >
            {{ label }}
        </span>
    </HeadlessButton>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

import TailwindCSS from '@/framework/utils/tailwindcss';

defineProps({
    label: {
        type: String,
        required: true,
    },
});

let textWidth = $ref(0);
const text = $ref<HTMLElement>();
const button = $ref<HTMLButtonElement>();
const hover = $ref(false);
const focused = $ref(false);
const textPadding = TailwindCSS.pixels('spacing.2');
const textStyles = $computed(() => {
    if (textWidth === 0) return;

    return hover || focused ? `width:${textWidth + textPadding}px` : 'width:0';
});

onMounted(() => {
    textWidth = text?.clientWidth ?? 0;
});
</script>
