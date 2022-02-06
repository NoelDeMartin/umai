<template>
    <label v-if="label" :for="id" class="sr-only">
        {{ label }}
    </label>
    <input
        :id="id"
        ref="input"
        :class="[
            'px-3 py-2 bg-white rounded-md border shadow-sm',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            error ? 'border-red-600' : 'border-gray-300'
        ]"
        :name="name"
        :value="inputValue"
        :type="type"
        :aria-describedby="error ? `${id}-error` : undefined"
        v-bind="$attrs"
        @input="onInput"
    >
    <p v-if="error" :id="`${id}-error`" class="mt-1 text-sm text-red-600 opacity-75">
        {{ error }}
    </p>
</template>

<script setup lang="ts">
import { uuid } from '@noeldemartin/utils';
import type { PropType } from 'vue';

import type Form from '@/framework/forms/Form';

import type IBaseInput from './BaseInput';

const { modelValue, name, form } = defineProps({
    modelValue: {
        type: String,
        default: '',
    },
    type: {
        type: String,
        default: 'text',
    },
    name: {
        type: String as PropType<string | undefined>,
        default: undefined,
    },
    label: {
        type: String as PropType<string | null>,
        default: null,
    },
    form: {
        type: Object as PropType<Form | null>,
        default: null,
    },
});
const emit = defineEmits(['update:modelValue']);

const id = uuid();
const input = $ref<HTMLInputElement>();
const formInput = $computed(() => form?.input<string>(name ?? '') ?? null);
const inputValue = $computed(() => formInput?.value ?? modelValue);
const error = $computed(() => formInput?.error);

function onInput() {
    const value = input?.value;

    formInput?.update(value);

    emit('update:modelValue', value);
}

defineExpose<IBaseInput>({
    focus: () => input?.focus(),
});
</script>
