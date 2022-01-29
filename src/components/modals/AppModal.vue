<template>
    <TransitionRoot as="template" :show="modal.open">
        <Dialog
            as="div"
            class="flex overflow-y-auto fixed inset-0 z-40 justify-center items-center"
            @close="$ui.closeModal(modal.id)"
        >
            <TransitionChild
                as="template"
                enter="ease-out duration-300"
                enter-from="opacity-0"
                enter-to="opacity-100"
                leave="ease-in duration-200"
                leave-from="opacity-100"
                leave-to="opacity-0"
            >
                <DialogOverlay class="fixed inset-0 bg-black bg-opacity-30 transition-opacity" />
            </TransitionChild>

            <!-- TODO close button (focusable element!) -->

            <TransitionChild
                as="template"
                enter="ease-out duration-300"
                enter-from="opacity-0 scale-90"
                enter-to="opacity-100 scale-100"
                leave="ease-in duration-200"
                leave-from="opacity-100 scale-100"
                leave-to="opacity-0 scale-90"
            >
                <div
                    :class="[
                        'flex flex-col overflow-hidden relative max-h-[90vh] bg-white shadow-xl transition-all m-edge',
                        noPadding || 'p-4',
                    ]"
                    v-bind="$attrs"
                >
                    <DialogTitle v-if="title" as="h2" class="text-lg font-medium leading-6 text-gray-900">
                        {{ title }}
                    </DialogTitle>
                    <div class="flex overflow-hidden flex-col mt-2 max-h-full">
                        <slot :close="(result?: unknown) => $ui.closeModal(modal.id, result)" />
                    </div>
                </div>
            </TransitionChild>
        </Dialog>
    </TransitionRoot>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';

import type { Modal } from '@/framework/core/services/UIService';

defineProps({
    modal: {
        type: Object as PropType<Modal>,
        required: true,
    },
    title: {
        type: String as PropType<string | null>,
        default: null,
    },
    noPadding: {
        type: Boolean,
        default: false,
    },
});
</script>
