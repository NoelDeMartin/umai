<template>
    <div aria-live="assertive" class="flex fixed inset-0 z-60 items-end px-4 py-6 pointer-events-none sm:p-6">
        <div class="flex flex-col items-center space-y-4 w-full sm:items-start">
            <transition-group
                :duration="{ enter: 300, leave: 200 }"
                enter-active-class="overflow-hidden"
                leave-active-class="overflow-hidden"
                @leave="$el => shrink($el as HTMLElement, { duration: 200, easing: 'ease-in', fill: 'forwards' })"
                @enter="$el => grow($el as HTMLElement, { duration: 300, easing: 'ease-out' })"
            >
                <div v-for="snackbar of $ui.snackbars" :key="snackbar.id">
                    <AppSnackbar :actions="snackbar.actions" :style="snackbar.style">
                        <CoreMarkdown raw :text="snackbar.message" />
                    </AppSnackbar>
                </div>
            </transition-group>
        </div>
    </div>
</template>

<script setup lang="ts">
import { grow, shrink } from '@/framework/utils/transitions';
</script>
