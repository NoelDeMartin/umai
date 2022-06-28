<template>
    <Dialog
        ref="$root"
        :open="true"
        class="relative z-50 opacity-0 pointer-events-none"
        @close="cancellable && close()"
    >
        <div class="fixed inset-0 flex items-center justify-center m-edge">
            <DialogPanel class="app-modal--panel max-w-full rounded-md shadow-xl bg-white">
                <!-- TODO close button (focusable element!) -->
                <DialogTitle v-if="title || $slots.title" as="h2" class="px-4 pt-4 text-lg font-medium leading-6 text-gray-900">
                    <slot name="title">
                        {{ title }}
                    </slot>
                </DialogTitle>
                <div ref="content" :class="['flex overflow-auto flex-col mt-2 max-h-full', noPadding || 'px-4 pb-4']">
                    <slot :close="close" />
                </div>
                <component
                    :is="childModal.component"
                    v-if="childModal"
                    :child-index="childIndex + 1"
                    :modal="childModal"
                    v-bind="childModal.props"
                />
            </DialogPanel>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';

import Events from '@/framework/core/facades/Events';
import UI from '@/framework/core/facades/UI';
import { useEvent } from '@/framework/utils/composition/events';
import type { Modal } from '@/framework/core/services/UIService';

import { hideModal, showModal } from './AppModal.transitions';

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

let hidden = $ref(true);
let closed = $ref(false);
const $root = $ref<{ $el?: HTMLElement } | null>(null);
const childModal = $computed(() => UI.modals[childIndex] ?? null);

async function hide(): Promise<void> {
    if (!$root?.$el) {
        return;
    }

    hidden || await hideModal($root.$el, 300);

    hidden = true;
}

async function show(): Promise<void> {
    if (!$root?.$el) {
        return;
    }

    hidden && await showModal($root.$el, 200);

    hidden = false;
}

async function close(result?: unknown) {
    if (closed) {
        return;
    }

    Events.emit('modal-will-close', { modal, result });

    await hide();

    closed = true;

    Events.emit('modal-closed', { modal, result });
}

useEvent('close-modal', async ({ id, result }) => {
    if (id !== modal.id) {
        return;
    }

    await close(result);
});

useEvent('hide-modal', async ({ id }) => {
    if (id !== modal.id) {
        return;
    }

    await hide();
});

useEvent('show-modal', async ({ id }) => {
    if (id !== modal.id) {
        return;
    }

    await show();
});
</script>
