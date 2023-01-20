<template>
    <textarea
        :id="input.id"
        :ref="el => (input.inputElement = el as HTMLInputElement)"
        :name="input.name"
        :placeholder="input.placeholder"
        :value="input.value as string ?? undefined"
        :aria-invalid="input.error ? 'true' : 'false'"
        :aria-describedby="input.error ? `${input.id}-error` : undefined"
        @input="input.update()"
    />
</template>

<script setup lang="ts">
import { injectOrFail } from '@/framework/utils/vue';

import type { HeadlessInputController } from './HeadlessInput';

const input = injectOrFail<HeadlessInputController>(
    'input',
    '<HeadlessInputTextArea> must be a child of a <HeadlessInput>',
);
</script>
