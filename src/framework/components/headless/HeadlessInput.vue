<template>
    <slot :has-errors="!!controller.error" />
</template>

<script setup lang="ts">
import { inject, onMounted, provide } from 'vue';
import { tap, uuid } from '@noeldemartin/utils';
import type { Tuple } from '@noeldemartin/utils';

import FormValue from '@/framework/forms/FormValue';
import { focusableElement } from '@/framework/components/headless';
import { booleanProp, mixedProp, stringProp } from '@/framework/utils/vue';
import type Form from '@/framework/forms/Form';

import type IHeadlessInput from './HeadlessInput';
import type { HeadlessInputController } from './HeadlessInput';

const {
    id,
    name,
    placeholder,
    modelValue,
    type,
    error: errorProp,
} = defineProps({
    id: stringProp(),
    name: stringProp(),
    placeholder: stringProp(),
    modelValue: mixedProp<string | number>([String, Number]),
    type: stringProp('text'),
    error: stringProp(),
    initialFocus: booleanProp(),
});
const emit = defineEmits(['update:modelValue']);

const form = inject<Form | null>('form', null);
const formInput = $computed(() => {
    if (!form || !name)
        return null;

    if (name.match(/\[\d+\]$/)) {
        const [inputName, inputPosition] = name.split('[') as Tuple<string, 2>;
        const input = form.input<unknown[]>(inputName);
        const index = parseInt(inputPosition.slice(0, -1));

        if (!input)
            return null;

        return {
            get value() {
                return input.value?.[index];
            },
            get error() {
                return input.error;
            },
            update(newValue: unknown) {
                const items = input.value as unknown[];
                const previousValue = items[index];

                input.update([
                    ...items.slice(0, index),
                    previousValue instanceof FormValue ? previousValue.update(newValue) : newValue,
                    ...items.slice(index + 1),
                ]);
            },
        };
    }

    return form.input<string | number>(name);
});
const inputValue = $computed(() => formInput?.value ?? modelValue);
const error = $computed(() => formInput?.error ?? errorProp);
const controller: HeadlessInputController = {
    id: id ?? uuid(),
    type,
    name: name ?? undefined,
    placeholder: placeholder ?? undefined,
    get error() {
        return error;
    },
    get value() {
        return inputValue instanceof FormValue ? inputValue.value : inputValue;
    },
    update() {
        emit(
            'update:modelValue',
            tap(this.inputElement?.value, value => formInput?.update(value)),
        );
    },
};

onMounted(() => controller.inputElement?.focus());

provide('input', controller);
defineExpose<IHeadlessInput>({
    ...focusableElement(() => controller.inputElement ?? null),

    get value() {
        return controller?.value;
    },
});
</script>
