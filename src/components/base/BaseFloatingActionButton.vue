<template>
    <!-- TODO a11y -->
    <button
        type="button"
        class="flex justify-center items-center px-3 text-white rounded-full shadow-lg bg-primary-600 min-w-clickable h-clickable hover:bg-primary-700"
        @focus="focused = true"
        @blur="focused = false"
        @mouseenter="hover = true"
        @mouseleave="hover = false"
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
import { computed, onMounted, ref } from 'vue';

import TailwindCSS from '@/framework/utils/tailwindcss';

defineProps({
    label: {
        type: String,
        required: true,
    },
});

const text = ref<HTMLElement>();
const hover = ref(false);
const focused = ref(false);
const textWidth = ref(0);
const textPadding = TailwindCSS.pixels('spacing.2');
const textStyles = computed(() => {
    if (textWidth.value === 0)
        return;

    return (hover.value || focused.value) ? `width:${textWidth.value + textPadding}px` : 'width:0';
});

onMounted(() => {
    textWidth.value = text.value?.clientWidth ?? 0;
});
</script>
