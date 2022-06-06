<template>
    <div class="flex overflow-hidden z-50 flex-row bg-white rounded-md shadow-sm pointer-events-auto">
        <div class="p-4">
            <CoreMarkdown :text="message" />
        </div>
        <button
            v-for="(action, index) of actions"
            :key="index"
            type="button"
            class="p-4 text-white bg-primary-600 hover:bg-primary-700"
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
