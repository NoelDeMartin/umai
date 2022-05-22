<template>
    <div
        aria-live="assertive"
        class="pointer-events-none fixed inset-0 z-50 flex items-end px-4 py-6 sm:p-6"
    >
        <div class="flex w-full flex-col items-center space-y-4 sm:items-start">
            <AppSnackbar
                v-for="snackbar of $ui.snackbars"
                :key="snackbar.id"
                :message="snackbar.message"
                :actions="snackbar.actions"
            />
        </div>
    </div>
</template>

<script setup lang="ts"></script>
