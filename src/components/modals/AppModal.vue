<template>
    <TransitionRoot as="template" :show="modal.open">
        <Dialog
            as="div"
            class="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto"
            @close="cancellable && $ui.closeModal(modal.id)"
        >
            <Portal v-if="$ui.snackbars.length > 0 && !childModal">
                <AppSnackbars />
            </Portal>
            <TransitionChild
                as="template"
                enter="ease-out duration-300"
                enter-from="opacity-0"
                enter-to="opacity-100"
                leave="ease-in duration-200"
                leave-from="opacity-100"
                leave-to="opacity-0"
            >
                <DialogOverlay
                    class="fixed inset-0 bg-black bg-opacity-30 transition-opacity"
                />
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
                    class="relative m-edge flex max-h-[90vh] flex-col overflow-hidden bg-white shadow-xl transition-all"
                    v-bind="$attrs"
                >
                    <DialogTitle
                        v-if="title || $slots.title"
                        as="h2"
                        class="px-4 pt-4 text-lg font-medium leading-6 text-gray-900"
                    >
                        <slot name="title">
                            {{ title }}
                        </slot>
                    </DialogTitle>
                    <div
                        ref="content"
                        :class="[
                            'mt-2 flex max-h-full flex-col overflow-auto',
                            noPadding || 'px-4 pb-4',
                        ]"
                    >
                        <slot
                            :close="(result?: unknown) => $ui.closeModal(modal.id, result)"
                        />
                    </div>
                </div>
            </TransitionChild>
            <component
                :is="childModal.component"
                v-if="childModal"
                :child-index="childIndex + 1"
                :modal="childModal"
                v-bind="childModal.props"
            />
        </Dialog>
    </TransitionRoot>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';

import UI from '@/framework/core/facades/UI';
import type { Modal } from '@/framework/core/services/UIService';

const { modal, childIndex } = defineProps({
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
    childIndex: {
        type: Number,
        required: true,
    },
    cancellable: {
        type: Boolean,
        default: true,
    },
});

const childModal = $computed(() => UI.modals[childIndex] ?? null);
</script>
