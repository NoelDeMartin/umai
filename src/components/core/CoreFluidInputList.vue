<template>
    <div ref="$root">
        <ul class="mb-4">
            <transition-group
                move-class="transition-all duration-300"
                @enter="animateItemEntrance($event as HTMLElement)"
            >
                <li v-for="(item, index) of items" :key="item.id">
                    <CoreFluidInputListItem
                        :ref="el => el && ($inputs[index] = el as unknown as IFocusable)"
                        v-bind="itemsProps[index]"
                        v-on="itemsEvents[index]"
                    />
                </li>
            </transition-group>
        </ul>
        <CoreButton
            ref="$addButton"
            secondary
            tinted
            @click="addItem(items.length - 1)"
        >
            {{ addLabel }}
        </CoreButton>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUpdate } from 'vue';

import type { IFocusable } from '@/framework/components/headless';

import { animateItemEntrance } from '@/components/core/lists/animations';
import { useList, useListEmits, useListProps } from '@/components/core/lists/composables';

const props = defineProps(useListProps());
const emit = defineEmits(useListEmits());

let $inputs = $ref<IFocusable[]>([]);
const $root = $ref<HTMLElement | null>(null);
const $addButton = $ref<IFocusable | null>(null);
const { addItem, items, focusableApi, itemsProps, itemsEvents } = useList(
    $$($root),
    $$($inputs),
    $$($addButton),
    props,
    emit,
);

onBeforeUpdate(() => $inputs = []);

defineExpose<IFocusable>(focusableApi);
</script>
