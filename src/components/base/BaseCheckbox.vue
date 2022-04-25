<template>
    <input
        ref="input"
        type="checkbox"
        :class="[
            'rounded border-gray-300 cursor-pointer form-checkbox text-primary-600',
            'focus:ring-primary-500 hover:bg-gray-200 disabled:bg-gray-300 disabled:cursor-default',
            otherClasses,
        ]"
        :name="name"
        :value="inputValue"
        :checked="!!inputValue"
        v-bind="otherAttrs"
        @change="onChange()"
    >
</template>

<script setup lang="ts">
import { arrayFilter, arrayWithout, objectWithoutEmpty } from '@noeldemartin/utils';
import { inject } from 'vue';
import type { PropType } from 'vue';

import type Form from '@/framework/forms/Form';

const { name, class: classProp, value, modelValue, disabled, form: formProp } = defineProps({
    name: {
        type: String,
        default: null,
    },
    class: {
        type: String,
        default: '',
    },
    value: {
        type: [Number, String],
        default: null,
    },
    modelValue: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    form: {
        type: Object as PropType<Form | null>,
        default: null,
    },
});
const emit = defineEmits(['update:modelValue']);

const form = formProp ?? inject('form', null);
const input = $ref<HTMLInputElement>();
const formInput = $computed(() => form?.input<boolean | unknown[]>(name ?? '') ?? null);
const inputValue = $computed(() => formInput?.value ?? modelValue);
const otherAttrs = $computed(() => objectWithoutEmpty({
    disabled: disabled || null,
    checked: Array.isArray(formInput?.value) && formInput?.value.includes(value) || null,
}));
const otherClasses = $computed(() => {
    const classNames = classProp.split(' ');

    return arrayFilter([
        classProp,
        !classNames.some(className => className.startsWith('w-')) && 'w-4',
        !classNames.some(className => className.startsWith('h-')) && 'h-4',
    ]).join(' ');
});

function onChange() {
    const isChecked = !!input?.matches(':checked');

    // TODO this should work with v-model as well, currently it only works in forms.
    if (formInput && Array.isArray(formInput?.value)) {
        formInput.update(isChecked ? [...formInput.value, value] : arrayWithout(formInput.value, value));

        return;
    }

    formInput?.update(isChecked);

    emit('update:modelValue', isChecked);
}
</script>
