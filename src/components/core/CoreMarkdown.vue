<template>
    <div v-safe-html="html" class="prose" @click="onClick($event)" />
</template>

<script setup lang="ts">
import type { PropType } from 'vue';

import { renderMarkdown } from '@/utils/markdown';

const { text, actions } = defineProps({
    text: {
        type: String,
        default: null,
    },
    actions: {
        type: Object as PropType<Record<string, () => unknown>>,
        default: () => ({}),
    },
});

const html = $computed(() => renderMarkdown(text));

function onClick(event: Event) {
    if (!(event.target instanceof HTMLElement))
        return;

    if (!(event.target instanceof HTMLAnchorElement) || !event.target.href.startsWith('action:'))
        return;

    event.preventDefault();

    actions[event.target.href.slice(7)]?.();
}
</script>
