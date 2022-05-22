<template>
    <input
        :id="input.id"
        :ref="el => (input.inputElement = el as HTMLInputElement)"
        :name="input.name"
        :placeholder="input.placeholder"
        :value="input.value"
        :type="input.type"
        :aria-invalid="input.error ? 'true' : 'false'"
        :aria-describedby="input.error ? `${input.id}-error` : undefined"
        @input="input.update()"
    >
</template>

<script setup lang="ts">
import { injectOrFail } from '@/framework/utils/vue';

import type { HeadlessInputController } from './HeadlessInput';

const input = injectOrFail<HeadlessInputController>(
    'input',
    '<HeadlessInputInput> must be a child of a <HeadlessInput>',
);
</script>
