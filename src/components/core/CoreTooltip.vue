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

        <!-- TODO fix width & position for mobile -->
        <span
            :id="id"
            role="tooltip"
            class="absolute -top-3 left-1/2 bg-gray-700 text-white whitespace-nowrap -translate-x-1/2 -translate-y-full px-2 py-1 rounded-md"
            :class="{ 'hidden': !isOpen }"
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
import { uuid } from '@noeldemartin/utils';

import { requiredStringProp } from '@/framework/utils/vue';
import { onUnmounted } from 'vue';

defineProps({
    text: requiredStringProp(),
});

const id = uuid();
let isOpen = $ref(false);

const onKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' && event.key !== 'Esc')
        return;

    close();
};

function open() {
    isOpen = true;

    // TODO extract global key bindings management
    document.addEventListener('keydown', onKeydown);
}

function close() {
    isOpen = false;

    document.removeEventListener('keydown', onKeydown);
}

onUnmounted(() => {
    document.removeEventListener('keydown', onKeydown);
});
</script>
