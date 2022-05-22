<template>
    <AppModal :title="title">
        <BaseMarkdown :text="content" />
    </AppModal>
</template>

<script setup lang="ts">
import { requiredStringProp, stringProp } from '@/framework/utils/vue';

defineProps({
    title: stringProp(),
    content: requiredStringProp(),
});
</script>
