<template>
    <div ref="$root" />
</template>

<script setup lang="ts">
import 'jsoneditor/dist/jsoneditor.min.css';

import JSONEditor from 'jsoneditor';
import { onMounted } from 'vue';

import { requiredObjectProp } from '@/framework/utils/vue';

const { json } = defineProps({
    json: requiredObjectProp(),
});

const $root = $ref<HTMLElement | null>(null);

onMounted(() => {
    if (!$root) {
        return;
    }

    const editor = new JSONEditor($root, {
        mode: 'view',
        navigationBar: false,
        statusBar: false,
    });

    editor.set(json);
});
</script>
