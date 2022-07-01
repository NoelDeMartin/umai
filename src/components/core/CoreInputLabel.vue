<template>
    <label ref="$root" :for="id">
        <slot />
    </label>
</template>

<script setup lang="ts">
import { inject } from 'vue';

import { element } from '@/framework/components/headless';
import type { IElement } from '@/framework/components/headless';

const $root = $ref<HTMLElement | null>(null);
const id = inject<string>('input-wrapper-id');

defineExpose<IElement>(element($$($root)));
</script>
