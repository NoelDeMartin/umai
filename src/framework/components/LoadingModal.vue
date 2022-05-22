<template>
    <div
        class="fixed inset-0 z-10 flex items-center justify-center bg-dark-overlay"
    >
        <div class="rounded-md bg-white p-4">
            {{ text }}
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({
    text: {
        type: String,
        default: 'Loading...',
    },
});
</script>
