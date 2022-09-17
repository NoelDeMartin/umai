<template>
    <textarea
        :id="input.id"
        :ref="el => (input.inputElement = el as HTMLInputElement)"
        :name="input.name"
        :placeholder="input.placeholder"
        :value="input.value as string ?? undefined"
        :aria-invalid="input.error ? 'true' : 'false'"
        :aria-describedby="input.error ? `${input.id}-error` : undefined"
        :tabindex="a11y?.hidden ? -1 : undefined"
        @input="input.update()"
    />
</template>

<script setup lang="ts">
import { inject } from 'vue';

import { injectOrFail } from '@/framework/utils/vue';
import type { A11y } from '@/framework/components/headless';

import type { HeadlessInputController } from './HeadlessInput';

const a11y = inject<A11y | null>('a11y', null);
const input = injectOrFail<HeadlessInputController>(
    'input',
    '<HeadlessInputTextArea> must be a child of a <HeadlessInput>',
);
</script>
