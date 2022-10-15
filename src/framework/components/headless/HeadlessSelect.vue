<template>
    <label>
        <span v-if="label" class="sr-only">{{ label }}</span>
        <select
            ref="$select"
            v-wobbly-border
            :model-value="modelValue"
            v-bind="$attrs"
            @change="updateSelected"
        >
            <option
                v-for="(option, index) of options"
                :key="index"
                :value="option.value"
                :selected="modelValue === option.value"
            >
                {{ option.text }}
            </option>
        </select>
    </label>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { requiredArrayProp, requiredMixedProp, stringProp } from '@/framework/utils/vue';

import type { SelectOption } from './HeadlessSelect';

export default defineComponent({ inheritAttrs: false });
</script>

<script setup lang="ts">
const { options } = defineProps({
    label: stringProp(),
    options: requiredArrayProp<SelectOption>(),
    modelValue: requiredMixedProp<string | number>([String, Number]),
});

const emit = defineEmits(['update:modelValue']);
const $select = $ref<HTMLSelectElement | null>(null);

function updateSelected() {
    if (!$select) {
        return;
    }

    emit('update:modelValue', options[$select.selectedIndex]?.value);
}

// TODO find a way to apply wobbly border to select from the outside
// TODO implement form controls
</script>
