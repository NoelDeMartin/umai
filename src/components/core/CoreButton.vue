<template>
    <HeadlessButton
        v-wobbly-border="wobblyBorder"
        class="inline-flex items-center px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
        :class="computedClasses"
    >
        <slot />
    </HeadlessButton>
</template>

<script setup lang="ts">
import { booleanProp, enumProp, objectProp } from '@/framework/utils/vue';
import type { WobblyBorderOptions } from '@/directives/wobbly-border';

import { CoreAlignment, CoreColor } from './constants';

const { color, alignment, secondary, tinted, clear } = defineProps({
    color: enumProp(CoreColor),
    alignment: enumProp(CoreAlignment),
    secondary: booleanProp(),
    tinted: booleanProp(),
    clear: booleanProp(),
    wobblyBorder: objectProp<WobblyBorderOptions>(),
});

interface ColorClasses {
    baseBackground: string;
    baseFocusBackground: string;
    baseFocusRing: string;
    tintedBackground: string;
    tintedText: string;
    accentHoverBackground: string;
    accentFocusHoverBackground: string;
}

enum Style {
    Primary = 'primary',
    Secondary = 'secondary',
    Clear = 'clear',
}

function getColorClasses(color: CoreColor): string {
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
                'hover:text-white focus:text-white',
                tinted
                    ? `${colorClasses.tintedBackground} ${colorClasses.tintedText}`
                    : 'bg-gray-300 text-gray-700',
                colorClasses.accentHoverBackground,
                colorClasses.accentFocusHoverBackground,
                colorClasses.baseFocusBackground,
                colorClasses.baseFocusRing,
            ].join(' ');
        case Style.Clear:
            return 'text-gray-700 hover:bg-gray-200 focus:bg-gray-100 focus:hover:bg-gray-200 focus:ring-gray-200';
    }
}

const colorsClasses: Record<CoreColor, ColorClasses> = {
    [CoreColor.Primary]: {
        baseBackground: 'bg-primary-600',
        baseFocusBackground: 'focus:bg-primary-600',
        baseFocusRing: 'focus:ring-primary-600',
        tintedBackground: 'bg-primary-gray-300',
        tintedText: 'text-primary-gray-700',
        accentHoverBackground: 'hover:bg-primary-700',
        accentFocusHoverBackground: 'focus:hover:bg-primary-700',
    },
    [CoreColor.Solid]: {
        baseBackground: 'bg-brand-solid-500',
        baseFocusBackground: 'focus:bg-brand-solid-500',
        baseFocusRing: 'focus:ring-brand-solid-500',
        tintedBackground: 'bg-brand-solid-gray-300',
        tintedText: 'text-brand-solid-gray-700',
        accentHoverBackground: 'hover:bg-brand-solid-700',
        accentFocusHoverBackground: 'focus:hover:bg-brand-solid-700',
    },
};
const alignmentClasses: Record<CoreAlignment, string> = {
    [CoreAlignment.Start]: 'justify-start',
    [CoreAlignment.Center]: 'justify-center',
    [CoreAlignment.End]: 'justify-end',
};

const style: Style = $computed(() => {
    if (secondary) return Style.Secondary;
    if (clear) return Style.Clear;

    return Style.Primary;
});
const computedClasses: string = $computed(() => `${alignmentClasses[alignment]} ${getColorClasses(color)}`);
</script>
