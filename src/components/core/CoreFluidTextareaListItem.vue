<template>
    <div ref="$root" class="relative group">
        <CoreFluidTextarea
            ref="$textarea"
            v-bind="inputProps"
            v-on="inputEvents"
            @keydown.ctrl.up.prevent="$emit('swapUp')"
            @keydown.ctrl.down.prevent="$emit('swapDown')"
        />
        <CoreFluidActionButton class="absolute right-1 bottom-1" v-bind="removeButtonProps" v-on="removeButtonEvents">
            <i-pepicons-trash aria-hidden="true" class="w-5 h-5" />
        </CoreFluidActionButton>
    </div>
</template>

<script setup lang="ts">
import type { IFocusable } from '@/framework/components/headless';

import { useListItem, useListItemEmits, useListItemProps } from '@/components/core/lists/composables';

const props = defineProps(useListItemProps());
const emit = defineEmits(['swapUp', 'swapDown', ...useListItemEmits()]);

const $root = $ref<HTMLElement | null>(null);
const $textarea = $ref<IFocusable | null>(null);
const { inputProps, inputEvents, removeButtonProps, removeButtonEvents, focusableApi } = useListItem(
    $$($root),
    $$($textarea),
    props,
    emit,
);

defineExpose<IFocusable>(focusableApi);
</script>
