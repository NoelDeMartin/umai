<template>
    <div ref="$root" class="flex text-gray-700 group">
        <span class="flex flex-shrink-0 justify-center items-center w-8 text-gray-400">
            <slot name="marker">
                <span class="w-2 h-2 bg-gray-300 rounded-full" />
            </slot>
        </span>
        <CoreFluidInput
            ref="$input"
            v-bind="inputProps"
            :wrapper-class="inputClass"
            v-on="inputEvents"
        />
        <CoreFluidActionButton class="ml-2 flex-shrink-0" v-bind="removeButtonProps" v-on="removeButtonEvents">
            <i-pepicons-trash aria-hidden="true" class="w-5 h-5" />
        </CoreFluidActionButton>
    </div>
</template>

<script setup lang="ts">
import type { IFocusable } from '@/framework/components/headless';

import { stringProp } from '@/framework/utils/vue';

import { useListItem, useListItemEmits, useListItemProps } from '@/components/core/lists/composables';

const props = defineProps({
    ...useListItemProps(),
    inputClass: stringProp(),
});
const emit = defineEmits(['remove', ...useListItemEmits()]);

const $root = $ref<HTMLElement | null>(null);
const $input = $ref<IFocusable | null>(null);
const { inputProps, inputEvents, removeButtonProps, removeButtonEvents, focusableApi } = useListItem(
    $$($root),
    $$($input),
    props,
    emit,
);

defineExpose<IFocusable>(focusableApi);
</script>
