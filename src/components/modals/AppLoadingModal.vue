<template>
    <AppModal :cancellable="false">
        <CoreMarkdown :text="text" />
        <div class="h-4 rounded-full overflow-hidden w-full bg-primary-200 mt-2 min-w-modal-content">
            <div class="progress-bar-content bg-primary-500 rounded-full h-full" />
        </div>
    </AppModal>
</template>

<script setup lang="ts">
defineProps({
    text: {
        type: String,
        default: 'Loading...',
    },
});
</script>

<style>
.progress-bar-content {
    width: 40%;
    animation: progress-bar 1s infinite linear;
}

 @keyframes progress-bar {
    0% { margin-left: -40%; }
    100% { margin-left: 100%; }
}
</style>
