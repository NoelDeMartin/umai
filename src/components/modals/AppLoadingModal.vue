<template>
    <AppModal :cancellable="false">
        <span>{{ text }}</span>
        <div
            class="mt-2 h-4 w-full min-w-modal-content overflow-hidden rounded-full bg-primary-200"
        >
            <div
                class="progress-bar-content h-full rounded-full bg-primary-500"
            />
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
    0% {
        margin-left: -40%;
    }
    100% {
        margin-left: 100%;
    }
}
</style>
