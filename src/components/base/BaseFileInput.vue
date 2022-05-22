<template>
    <label :for="name">
        <slot />
        <input
            :id="name"
            ref="input"
            :name="name"
            :accept="accept"
            type="file"
            class="sr-only"
            @change="uploadFile()"
        >
    </label>
</template>

<script setup lang="ts">
import { uuid } from '@noeldemartin/utils';
import type { PropType } from 'vue';

import I18n from '@/framework/core/facades/I18n';

import { BaseFileInputParseFormat } from './BaseFileInput';

const { parse } = defineProps({
    accept: {
        type: String,
        default: null,
    },
    parse: {
        type: String as PropType<BaseFileInputParseFormat | null>,
        default: null,
    },
});
const emit = defineEmits(['start', 'success', 'error']);

const name = uuid();
const input = $ref<HTMLInputElement>();

function uploadFile() {
    const file = input.files?.[0];

    if (!file) return;

    emit('start');

    if (!parse) {
        emit('success', file);

        return;
    }

    parseFile(file, parse);
}

function parseFile(file: File, format: BaseFileInputParseFormat) {
    const reader = new FileReader();
    const parseResult = (result: string) => {
        switch (format) {
            case BaseFileInputParseFormat.Json:
                return JSON.parse(result);
            default:
                return result;
        }
    };

    reader.onerror = () => emit('error', I18n.translate('errors.fileUpload'));
    reader.onload = () => emit('success', parseResult(reader.result as string));

    reader.readAsText(file);
}
</script>
