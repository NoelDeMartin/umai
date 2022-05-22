<template>
    <div
        class="pointer-events-auto z-50 flex flex-row overflow-hidden rounded-md bg-white shadow-sm"
    >
        <div class="p-4">
            <BaseMarkdown :text="message" />
        </div>
        <button
            v-for="(action, index) of actions"
            :key="index"
            type="button"
            class="bg-primary-600 p-4 text-white hover:bg-primary-700"
            @click="action.handler"
        >
            {{ action.text }}
        </button>
    </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';

import type { SnackbarAction } from '@/framework/core/services/UIService';

defineProps({
    message: {
        type: String,
        required: true,
    },
    actions: {
        type: Array as PropType<SnackbarAction[]>,
        default: () => [],
    },
});
</script>
