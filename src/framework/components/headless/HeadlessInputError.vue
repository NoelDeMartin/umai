<template>
    <p v-if="input.error" :id="`${input.id}-error`">
        {{ input.error }}
    </p>
</template>

<script setup lang="ts">
import { injectOrFail } from '@/framework/utils/vue';

import type { HeadlessInputController } from './HeadlessInput';

const input = injectOrFail<HeadlessInputController>(
    'input',
    '<HeadlessInputError> must be a child of a <HeadlessInput>',
);
</script>
