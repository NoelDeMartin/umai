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

function onClick({ target }: Event) {
    if (!(target instanceof HTMLElement)) {
        return;
    }

    if (!target.dataset.markdownAction) {
        return;
    }

    actions[target.dataset.markdownAction]?.();
}
</script>
