<template>
    <ol ref="list" class="list-none">
        <slot />
    </ol>
</template>

<script setup lang="ts">
import { provide } from 'vue';

import { useListDragging } from '@/framework/utils/composition/list-dragging';
import type { ListDraggingController } from '@/framework/utils/composition/list-dragging';

const emit = defineEmits(['swapItems']);
const list = $ref<HTMLElement>();

provide<ListDraggingController>(
    'list-dragging',
    useListDragging($$(list), (currentItem, nextItem) =>
        emit('swapItems', currentItem, nextItem, false)),
);
</script>
