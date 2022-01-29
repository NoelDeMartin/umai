<template>
    <div v-safe-html="html" class="prose" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { marked } from 'marked';

const props = defineProps({
    text: {
        type: String,
        default: null,
    },
});

const html = computed(() => marked(props.text));
</script>
