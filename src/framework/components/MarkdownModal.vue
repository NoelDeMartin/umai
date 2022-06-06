<template>
    <AppModal :title="title">
        <CoreMarkdown :text="content" />
    </AppModal>
</template>

<script setup lang="ts">
import { requiredStringProp, stringProp } from '@/framework/utils/vue';

defineProps({
    title: stringProp(),
    content: requiredStringProp(),
});
</script>
