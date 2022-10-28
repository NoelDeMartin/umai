<template>
    <HeadlessSelect
        class="
            form-select cursor-pointer border-0
            hover:bg-gray-100
            focus:ring-primary-600 focus:bg-primary-gray-100
        "
        :label="label"
        :model-value="modelValue"
        :options="options"
        v-bind="$attrs"
        @update:modelValue="$emit('update:modelValue', $event)"
    />
</template>

<script setup lang="ts">
import { requiredArrayProp, requiredMixedProp, stringProp } from '@/framework/utils/vue';

import type { SelectOption } from '@/framework/components/headless/HeadlessSelect';

defineProps({
    label: stringProp(),
    options: requiredArrayProp<SelectOption>(),
    modelValue: requiredMixedProp<string | number>([String, Number]),
});

defineEmits(['update:modelValue']);
</script>
