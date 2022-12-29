<template>
    <HeadlessLink v-wobbly-border class="core-link inline-block focus-visible:outline-none focus-visible:ring-4" :class="computedClasses">
        <slot />
    </HeadlessLink>
</template>

<script setup lang="ts">
import { booleanProp, enumProp } from '@/framework/utils/vue';

import { CoreColor } from './index';

const { color, secondary } = defineProps({
    color: enumProp(CoreColor),
    secondary: booleanProp(),
});

interface ColorClasses {
    text: string;
    hoverText: string;
    focusVisibleRing: string;
    focusVisibleBackground: string;
}

const colorsClasses: Record<CoreColor, ColorClasses> = {
    [CoreColor.Primary]: {
        text: 'text-primary-700',
        hoverText: 'hover:text-primary-700',
        focusVisibleRing: 'focus-visible:ring-primary-200',
        focusVisibleBackground: 'focus-visible:bg-primary-200',
    },
    [CoreColor.Solid]: {
        text: 'text-brand-solid-700',
        hoverText: 'hover:text-brand-solid-700',
        focusVisibleRing: 'focus-visible:ring-brand-solid-100',
        focusVisibleBackground: 'focus-visible:bg-brand-solid-100',
    },
    [CoreColor.Danger]: {
        text: 'text-red-700',
        hoverText: 'hover:text-red-700',
        focusVisibleRing: 'focus-visible:ring-red-100',
        focusVisibleBackground: 'focus-visible:bg-red-100',
    },
};

const computedClasses = $computed(() => {
    const colorClasses = colorsClasses[color];

    return (
        secondary
            ? [
                'text-gray-700',
                colorClasses.hoverText,
                colorClasses.focusVisibleBackground,
                colorClasses.focusVisibleRing,
            ]
            : [
                'hover:underline',
                colorClasses.text,
                colorClasses.focusVisibleBackground,
                colorClasses.focusVisibleRing,
            ]
    ).join(' ');
});
</script>
