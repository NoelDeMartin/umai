<template>
    <div class="fixed inset-0 bg-dark-overlay flex items-center justify-center z-10">
        <div class="bg-white p-4 rounded-md">
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
