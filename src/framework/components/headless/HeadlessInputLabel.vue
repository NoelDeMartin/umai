<template>
    <label :for="input.id">
        <slot />
    </label>
</template>

<script setup lang="ts">
import { injectOrFail } from '@/framework/utils/vue';

import type { HeadlessInputController } from './HeadlessInput';

const input = injectOrFail<HeadlessInputController>(
    'input',
    '<HeadlessInputLabel> must be a child of a <HeadlessInput>',
);
</script>
