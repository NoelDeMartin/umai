<template>
    <!-- TODO a11y -->
    <button
        ref="button"
        type="button"
        class="flex justify-center items-center px-3 text-white rounded-full shadow-lg bg-primary-600 min-w-clickable h-clickable hover:bg-primary-700"
        @focus="focused = true"
        @blur="focused = false"
        @mouseenter="hover = true"
        @mouseleave="hover = false"
        @click="button?.blur()"
    >
        <i-mdi-plus class="w-5 h-5" />
        <span
            ref="text"
            class="overflow-hidden transition-[width] duration-150 whitespace-nowrap"
            :style="textStyles"
        >
            {{ label }}
        </span>
    </button>
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
    if (textWidth === 0)
        return;

    return (hover || focused) ? `width:${textWidth + textPadding}px` : 'width:0';
});

onMounted(() => {
    textWidth = text?.clientWidth ?? 0;
});
</script>
