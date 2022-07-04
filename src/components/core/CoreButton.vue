<template>
    <HeadlessButton
        ref="$root"
        v-wobbly-border="wobblyBorder"
        :class="computedClasses"
        :disabled="disabled"
    >
        <slot />
    </HeadlessButton>
</template>

<script setup lang="ts">
import TailwindCSS from '@/framework/utils/tailwindcss';
import { booleanProp, enumProp, objectProp, stringProp } from '@/framework/utils/vue';
import { focusable } from '@/framework/components/headless';
import type { IFocusable } from '@/framework/components/headless';

import type { WobblyBorderOptions } from '@/directives/wobbly-border';

import { CoreAlignment, CoreColor } from './index';

const { disabled, color, class: customClasses, alignment, secondary, tinted, clear } = defineProps({
    disabled: booleanProp(false),
    color: enumProp(CoreColor),
    class: stringProp(''),
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

    if (disabled) {
        return 'bg-gray-300 text-gray-700 opacity-75 cursor-not-allowed';
    }

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

const $root = $ref<IFocusable | null>(null);
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
    [CoreColor.Danger]: {
        baseBackground: 'bg-red-500',
        baseFocusBackground: 'focus:bg-red-500',
        baseFocusRing: 'focus:ring-red-500',
        tintedBackground: 'bg-red-gray-300',
        tintedText: 'text-red-gray-700',
        accentHoverBackground: 'hover:bg-red-700',
        accentFocusHoverBackground: 'focus:hover:bg-red-700',
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
const computedClasses: string = $computed(() => {
    const defaultClasses = [
        'inline-flex items-center px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
        alignmentClasses[alignment],
        getColorClasses(color),
    ].join(' ');

    return customClasses
        ? TailwindCSS.mergeClasses(defaultClasses, customClasses)
        : defaultClasses;
});

defineExpose<IFocusable>(focusable($$($root)));
</script>
