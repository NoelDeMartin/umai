<template>
    <Dialog
        ref="$root"
        :open="true"
        class="relative z-50 opacity-0 pointer-events-none"
        @close="cancellable && close()"
    >
        <div class="fixed inset-0 flex items-center justify-center m-edge">
            <DialogPanel class="app-modal--panel relative max-w-full max-h-full overflow-hidden flex flex-col rounded-md shadow-xl bg-white">
                <DialogTitle
                    v-if="title || $slots.title"
                    as="h2"
                    class="pt-4 pl-4 text-lg font-medium leading-6 text-gray-900"
                    :class="{
                        'pr-16': cancellable,
                        'pr-4': !cancellable,
                    }"
                >
                    <slot name="title">
                        {{ title }}
                    </slot>
                </DialogTitle>
                <CoreButton
                    v-if="cancellable"
                    clear
                    :aria-label="$t('ui.close')"
                    :label="$t('ui.close')"
                    class="absolute w-clickable h-clickable top-2 right-2"
                    @click="close()"
                >
                    <i-pepicons-times class="w-6 h-6" aria-hidden="true" />
                </CoreButton>
                <div
                    ref="content"
                    class="flex overflow-auto flex-col mt-2 max-h-full"
                    :class="{
                        'pl-4 pb-4': padding,
                        'pr-4': (title || !cancellable) && padding,
                        'pr-12': !title && cancellable,
                    }"
                >
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
import { provide } from 'vue';

import Events from '@/framework/core/facades/Events';
import UI from '@/framework/core/facades/UI';
import { booleanProp, requiredNumberProp, requiredObjectProp, stringProp } from '@/framework/utils/vue';
import { useEvent } from '@/framework/utils/composition/events';
import type { Modal } from '@/framework/core/services/UIService';

import { hideModal, showModal } from './AppModal.transitions';
import type IAppModal from './AppModal';

const { modal, childIndex } = defineProps({
    modal: requiredObjectProp<Modal>(),
    title: stringProp(),
    childIndex: requiredNumberProp(),
    padding: booleanProp(true),
    cancellable: booleanProp(true),
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

const publicApi = { close };

provide<IAppModal>('modal', publicApi);
defineExpose<IAppModal>(publicApi);
</script>
