<template>
    <aside v-if="modal">
        <component
            :is="modal.component"
            v-if="modal"
            :child-index="1"
            :modal="modal"
            v-bind="modal.props"
        />
    </aside>
    <div aria-live="assertive" class="flex fixed inset-0 z-50 items-end px-4 py-6 pointer-events-none sm:p-6">
        <div class="flex flex-col items-center space-y-4 w-full sm:items-start">
            <AppSnackbar
                v-for="snackbar of $ui.snackbars"
                :key="snackbar.id"
                :message="snackbar.message"
                :actions="snackbar.actions"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import UI from '@/framework/core/facades/UI';

const modal = $computed(() => UI.modals[0] ?? null);
</script>
