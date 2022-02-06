<template>
    <div v-safe-html="html" class="prose" />
</template>

<script setup lang="ts">
import { marked } from 'marked';

const { text } = defineProps({
    text: {
        type: String,
        default: null,
    },
});

const html = $computed(() => marked(text));
</script>
