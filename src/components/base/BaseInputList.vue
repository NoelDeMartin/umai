<template>
    <div>
        <ul ref="list" class="mb-4">
            <transition-group move-class="transition-all duration-300">
                <li v-for="(item, index) of items" :key="item.id">
                    <BaseInputListItem
                        :ref="el => el && (inputs[index] = el as unknown as IBaseInputListItem)"
                        v-model="item.value"
                        :name="`${itemNamePrefix}-${item.id}`"
                        :placeholder="itemPlaceholder ?? undefined"
                        :remove-label="itemRemoveLabel ?? undefined"
                        :remove-a11y-label="itemRemoveA11yLabel ?? undefined"
                        @add="addItem(index)"
                        @remove="removeItem(index)"
                    />
                </li>
            </transition-group>
        </ul>
        <BaseButton @click="addItem(items.length - 1)">
            {{ addLabel }}
        </BaseButton>
    </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUpdate } from 'vue';
import { arrayWithItemAt, arrayWithoutIndex, uuid } from '@noeldemartin/utils';
import type { PropType } from 'vue';

import type IBaseInputListItem from './BaseInputListItem';
import type { BaseInputListItemData } from './BaseInputListItem';

const emit = defineEmits(['update:modelValue']);
const { modelValue } = defineProps({
    modelValue: {
        type: Array as PropType<BaseInputListItemData[]>,
        default: [] as BaseInputListItemData[],
    },
    addLabel: {
        type: String,
        default: 'Add',
    },
    itemNamePrefix: {
        type: String,
        default: 'item',
    },
    itemPlaceholder: {
        type: String,
        default: null,
    },
    itemRemoveLabel: {
        type: String,
        default: null,
    },
    itemRemoveA11yLabel: {
        type: String,
        default: null,
    },
});

let inputs = $ref<IBaseInputListItem[]>([]);
const list = $ref<HTMLElement>();
const items = $computed(() => modelValue);

onBeforeUpdate(() => (inputs = []));

async function addItem(index: number) {
    const newItem: BaseInputListItemData = { id: uuid(), value: '' };

    emit('update:modelValue', arrayWithItemAt(items, newItem, index));

    await nextTick();

    inputs[index + 1]?.focus();
}

async function removeItem(index: number) {
    inputs[index === 0 ? 1 : index - 1]?.focus();

    await inputs[index]?.playLeaveAnimation();

    emit('update:modelValue', arrayWithoutIndex(items, index));
}
</script>
