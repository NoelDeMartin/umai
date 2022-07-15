<template>
    <span
        class="relative"
        @mouseenter="open()"
        @touchstart="open()"
        @mouseleave="close()"
    >
        <slot
            :tooltip-id="id"
            :open-tooltip="open"
            :close-tooltip="close"
        />
        <span
            :id="id"
            ref="$wrapper"
            role="tooltip"
            class="absolute -top-3 left-1/2 bg-gray-700 text-white -translate-x-1/2 -translate-y-full px-2 py-1 rounded-md"
            :style="inlineWrapperStyle"
            :class="{
                'hidden': !isOpen,
                'whitespace-nowrap': !inlineWrapperStyle,
            }"
        >
            {{ text }}
        </span>
        <span
            class="absolute pointer-events-none top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 border-t-gray-700 border-transparent border-x-[.75rem] border-y-[.75rem]"
            :class="{ 'hidden': !isOpen }"
        />
    </span>
</template>

<script setup lang="ts">
import { nextTick, onUnmounted } from 'vue';
import { uuid } from '@noeldemartin/utils';

import TailwindCSS from '@/framework/utils/tailwindcss';
import { requiredStringProp } from '@/framework/utils/vue';

defineProps({
    text: requiredStringProp(),
});

const id = uuid();
const $wrapper = $ref<HTMLDivElement | null>(null);
let isOpen = $ref(false);
let inlineWrapperStyle = $ref<string>('');

const onKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' && event.key !== 'Esc')
        return;

    close();
};

async function open() {
    isOpen = true;

    // TODO extract global key bindings management
    document.addEventListener('keydown', onKeydown);

    await nextTick();

    calculateWrapperWidth();
}

function close() {
    isOpen = false;

    document.removeEventListener('keydown', onKeydown);
}

function calculateWrapperWidth() {
    if (!$wrapper || inlineWrapperStyle) {
        return;
    }

    const edge = TailwindCSS.pixels('spacing.edge');
    const boundingRect = $wrapper.getBoundingClientRect();
    const overflowingWidth = -Math.min(
        0,
        boundingRect.x - edge,
        window.innerWidth - (boundingRect.width - boundingRect.x) - edge,
    );
    const wrapperWidth = $wrapper.clientWidth - 2 * overflowingWidth;

    inlineWrapperStyle = `width:${wrapperWidth + TailwindCSS.pixels('spacing.1')}px`;
}

onUnmounted(() => document.removeEventListener('keydown', onKeydown));
</script>
