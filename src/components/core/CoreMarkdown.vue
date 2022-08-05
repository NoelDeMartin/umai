<template>
    <div v-safe-html="html" :class="raw || 'prose'" @click="onClick($event)" />
</template>

<script setup lang="ts">
import { booleanProp, objectProp, requiredStringProp } from '@/framework/utils/vue';

import { renderMarkdown } from '@/utils/markdown';

const { text, actions, heading } = defineProps({
    text: requiredStringProp(),
    actions: objectProp<Record<string, () => unknown>>(() => ({})),
    heading: booleanProp(),
    raw: booleanProp(),
});

const html = $computed(() => {
    const html = renderMarkdown(text);

    return heading
        ? html
            .replace('<p>', '<span>')
            .replace('</p>', '</span>')
        : html;
});

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
