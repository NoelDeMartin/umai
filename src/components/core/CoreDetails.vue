<template>
    <details @toggle="(event: Event) => $emit((event.target as HTMLDetailsElement).open ? 'open' : 'close')">
        <summary
            v-wobbly-border
            class="cursor-pointer text-gray-700 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-gray-200 focus:bg-gray-100 focus:hover:bg-gray-200 focus:ring-gray-200"
        >
            {{ summary }}
        </summary>

        <div class="mt-4">
            <slot />
        </div>
    </details>
</template>

<script setup lang="ts">
import { requiredStringProp } from '@/framework/utils/vue';

defineProps({
    summary: requiredStringProp(),
});
defineEmits(['open', 'close']);
</script>
