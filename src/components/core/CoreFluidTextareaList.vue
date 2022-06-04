<template>
    <div ref="$root">
        <span class="sr-only">{{ instructionsA11y }}</span>
        <SortableList class="pl-0" @swapItems="swapItems">
            <transition-group
                move-class="transition-all duration-300"
                @enter="animateItemEntrance($event as HTMLElement)"
            >
                <SortableListItem
                    v-for="(item, index) of items"
                    :key="item.id"
                    class="mt-4"
                >
                    <template #marker>
                        <span class="text-lg font-semibold text-primary-700" aria-hidden="true">
                            {{ index + 1 }}.
                        </span>
                    </template>
                    <CoreFluidTextareaListItem
                        :ref="el => el && ($textareas[index] = el as unknown as IFocusable)"
                        class="w-full"
                        v-bind="itemsProps[index]"
                        v-on="itemsEvents[index]"
                        @swapUp="swapItems(index, index - 1, true)"
                        @swapDown="swapItems(index, index + 1, true)"
                    />
                </SortableListItem>
            </transition-group>
        </SortableList>
        <CoreButton
            ref="$addButton"
            class="mt-4"
            secondary
            tinted
            @click="addItem(items.length - 1)"
        >
            {{ addLabel }}
        </CoreButton>
    </div>
</template>

<script setup lang="ts">
import { arraySwap, tap } from '@noeldemartin/utils';
import { nextTick, onBeforeUpdate } from 'vue';

import { requiredStringProp } from '@/framework/utils/vue';
import type { IFocusable } from '@/framework/components/headless';

import { animateItemEntrance } from '@/components/core/lists/animations';
import { useList, useListEmits, useListProps } from '@/components/core/lists/composables';

const props = defineProps({
    instructionsA11y: requiredStringProp(),
    ...useListProps(),
});
const emit = defineEmits(useListEmits());

let $textareas = $ref<IFocusable[]>([]);
const $root = $ref<HTMLElement | null>(null);
const $addButton = $ref<IFocusable | null>(null);
const { addItem, updateItems, items, focusableApi, itemsProps, itemsEvents } = useList(
    $$($root),
    $$($textareas),
    $$($addButton),
    props,
    emit,
);

onBeforeUpdate(() => $textareas = []);

async function swapItems(firstIndex: number, secondIndex: number, focus?: boolean) {
    if (Math.max(firstIndex, secondIndex) > items.value.length - 1 || Math.min(firstIndex, secondIndex) < 0)
        return;

    updateItems(tap(items.value.slice(), items => arraySwap(items, firstIndex, secondIndex)));

    if (!focus)
        return;

    await nextTick();

    $textareas[secondIndex]?.focus();
}

defineExpose<IFocusable>(focusableApi);
</script>
