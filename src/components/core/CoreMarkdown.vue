<template>
    <div v-safe-html="html" :class="raw || 'prose'" @click="onClick($event)" />
</template>

<script setup lang="ts">
import { booleanProp, objectProp, requiredStringProp } from '@/framework/utils/vue';

import { renderMarkdown } from '@/utils/markdown';

const { text, actions } = defineProps({
    text: requiredStringProp(),
    actions: objectProp<Record<string, () => unknown>>(() => ({})),
    raw: booleanProp(),
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
