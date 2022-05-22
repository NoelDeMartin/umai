<template>
    <slot :has-errors="!!controller.error" />
</template>

<script setup lang="ts">
import { inject, provide } from 'vue';
import { tap, uuid } from '@noeldemartin/utils';

import { mixedProp, objectProp, stringProp } from '@/framework/utils/vue';
import type Form from '@/framework/forms/Form';

import type IHeadlessInput from './HeadlessInput';
import type { HeadlessInputController } from './HeadlessInput';

const {
    name,
    placeholder,
    form: formProp,
    modelValue,
    type,
    error: errorProp,
} = defineProps({
    name: stringProp(),
    placeholder: stringProp(),
    form: objectProp<Form>(),
    modelValue: mixedProp<string | number>([String, Number]),
    type: stringProp('text'),
    error: stringProp(),
});
const emit = defineEmits(['update:modelValue']);

const form = formProp ?? inject('form', null);
const formInput = $computed(() => form?.input<string>(name ?? '') ?? null);
const inputValue = $computed(() => formInput?.value ?? modelValue);
const error = $computed(() => formInput?.error ?? errorProp);
const controller: HeadlessInputController = {
    id: uuid(),
    type,
    name: name ?? undefined,
    placeholder: placeholder ?? undefined,
    get error() {
        return error;
    },
    get value() {
        return inputValue;
    },
    update() {
        emit(
            'update:modelValue',
            tap(this.inputElement?.value, (value) => formInput?.update(value)),
        );
    },
};

provide('input', controller);
defineExpose<IHeadlessInput>({
    focus: () => controller.inputElement?.focus(),
});
</script>
