<template>
    <HeadlessButton
        ref="$root"
        v-wobbly-border="{ min: 30, max: 42 }"
        :class="[
            'flex items-center justify-center w-clickable h-clickable text-primary-gray-700 opacity-0',
            'group-hover:opacity-80 group-focus-within:opacity-80',
            'hover:bg-primary-gray-300 hover:!opacity-100',
            'focus:outline-none focus:border-2 focus:border-primary-600 focus:!opacity-100',
        ]"
    >
        <slot />
    </HeadlessButton>
</template>

<script setup lang="ts">
import { focusable } from '@/framework/components/headless';
import type { IFocusable } from '@/framework/components/headless';

const $root = $ref<IFocusable | null>(null);

defineExpose<IFocusable>(focusable($$($root)));
</script>
