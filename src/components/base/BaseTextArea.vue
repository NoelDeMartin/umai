<template>
    <label v-if="label" :for="id" class="sr-only">
        {{ label }}
    </label>
    <textarea
        :id="id"
        ref="textarea"
        :name="name"
        :value="inputValue"
        :aria-describedby="error ? `${name}-error` : undefined"
        class="form-textarea w-full focus:border-primary-500 focus:shadow-primary-500"
        v-bind="$attrs"
        @input="onInput"
    />
    <p
        v-if="error"
        :id="`${name}-error`"
        class="mt-1 text-sm text-red-600 opacity-75"
    >
        {{ error }}
    </p>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import type { PropType } from 'vue';

import type Form from '@/framework/forms/Form';
import { uuid } from '@noeldemartin/utils';

const {
    name,
    modelValue,
    form: formProp,
} = defineProps({
    name: {
        type: String as PropType<string | undefined>,
        default: undefined,
    },
    modelValue: {
        type: String,
        default: '',
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

const form = formProp ?? inject('form', null);
const id = uuid();
const textarea = $ref<HTMLTextAreaElement>();
const formInput = $computed(() => form?.input<string>(name ?? '') ?? null);
const inputValue = $computed(() => formInput?.value ?? modelValue);
const error = $computed(() => formInput?.error);

function onInput() {
    const value = textarea?.value;

    formInput?.update(value);

    emit('update:modelValue', value);
}
</script>
