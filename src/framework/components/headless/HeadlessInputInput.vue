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
        :tabindex="a11y?.hidden.value ? -1 : undefined"
        @input="input.update()"
    >
</template>

<script setup lang="ts">
import { inject } from 'vue';

import { injectOrFail } from '@/framework/utils/vue';
import type { A11y } from '@/framework/components/headless';

import type { HeadlessInputController } from './HeadlessInput';

const a11y = inject<A11y | null>('a11y', null);
const input = injectOrFail<HeadlessInputController>(
    'input',
    '<HeadlessInputInput> must be a child of a <HeadlessInput>',
);
</script>
