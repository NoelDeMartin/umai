<template>
    <HeadlessButton
        v-wobbly-border
        class="inline-flex items-center px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
        :class="computedClasses"
    >
        <slot />
    </HeadlessButton>
</template>

<script lang="ts">
import { booleanProp, enumProp } from '@/framework/utils/vue';

import { AppButtonColor } from './AppButton';
</script>

<script setup lang="ts">
const { color, secondary, clear } = defineProps({
    color: enumProp(AppButtonColor),
    secondary: booleanProp(),
    clear: booleanProp(),
});

interface ColorClasses {
    baseBackground: string;
    baseFocusBackground: string;
    baseFocusRing: string;
    accentHoverBackground: string;
    accentFocusHoverBackground: string;
}

enum Style {
    Primary = 'primary',
    Secondary = 'secondary',
    Clear = 'clear',
}

const colorsClasses: Record<AppButtonColor, ColorClasses> = {
    [AppButtonColor.Primary]: {
        baseBackground: 'bg-primary-600',
        baseFocusBackground: 'focus:bg-primary-600',
        baseFocusRing: 'focus:ring-primary-600',
        accentHoverBackground: 'hover:bg-primary-700',
        accentFocusHoverBackground: 'focus:hover:bg-primary-700',
    },
    [AppButtonColor.Solid]: {
        baseBackground: 'bg-brand-solid-500',
        baseFocusBackground: 'focus:bg-brand-solid-500',
        baseFocusRing: 'focus:ring-brand-solid-500',
        accentHoverBackground: 'hover:bg-brand-solid-700',
        accentFocusHoverBackground: 'focus:hover:bg-brand-solid-700',
    },
};

const style: Style = $computed(() => {
    if (secondary) return Style.Secondary;
    if (clear) return Style.Clear;

    return Style.Primary;
});
const computedClasses: string = $computed(() => {
    const colorClasses = colorsClasses[color];

    switch (style) {
        case Style.Primary:
            return [
                'text-white',
                colorClasses.baseBackground,
                colorClasses.accentHoverBackground,
                colorClasses.baseFocusRing,
            ].join(' ');
        case Style.Secondary:
            return [
                'bg-gray-300 text-gray-700 hover:text-white focus:text-white',
                colorClasses.accentHoverBackground,
                colorClasses.accentFocusHoverBackground,
                colorClasses.baseFocusBackground,
                colorClasses.baseFocusRing,
            ].join(' ');
        case Style.Clear:
            return 'text-gray-700 hover:bg-gray-200 focus:bg-gray-100 focus:hover:bg-gray-200 focus:ring-gray-200';
    }
});
</script>
