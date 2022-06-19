<template>
    <li class="my-0">
        <div class="flex group">
            <div class="relative mr-2">
                <div class="flex justify-center min-w-clickable group-hover:opacity-0">
                    <slot name="marker" />
                </div>
                <button
                    type="button"
                    tabindex="-1"
                    aria-hidden="true"
                    :class="[
                        'absolute top-0 inset-x-1/2 -translate-x-1/2 w-clickable h-clickable',
                        'hidden justify-center items-center text-gray-900 rounded-full opacity-50',
                        'hover:!opacity-100 group-hover:flex',
                    ]"
                    :title="$t('ui.drag')"
                    @mousedown="startDragging"
                    @touchstart="startDragging"
                >
                    <i-carbon-drag-vertical class="w-4 h-4" />
                </button>
            </div>
            <slot />
        </div>
    </li>
</template>

<script setup lang="ts">
import { inject } from 'vue';

import type { ListDraggingController } from '@/framework/utils/composition/list-dragging';

const emit = defineEmits([
    'dragStart',
    'dragStop',
    'dragUpdate',
    'swapDown',
    'swapUp',
]);

const dragging = inject<ListDraggingController>('list-dragging');

function startDragging(event: MouseEvent | TouchEvent) {
    const onMove = (event: MouseEvent | TouchEvent) => {
        event.preventDefault();

        dragging?.update(event);

        emit('dragUpdate', event);
    };
    const onRelease = (event: MouseEvent | TouchEvent) => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('mouseup', onRelease);
        document.removeEventListener('touchend', onRelease);

        event.preventDefault();

        dragging?.stop();

        emit('dragStop', event);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove);
    document.addEventListener('mouseup', onRelease);
    document.addEventListener('touchend', onRelease);

    event.preventDefault();

    dragging?.start(event);

    emit('dragStart', event);
}
</script>
