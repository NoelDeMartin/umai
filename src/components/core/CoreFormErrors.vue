<template>
    <div v-if="(form.showErrors as ComputedRef<boolean>).value" class="prose w-full">
        <p v-for="(error, index) of (form.errors as ComputedRef<string[]>).value" :key="index" class="text-sm text-red-600">
            {{ error }}
        </p>
    </div>
</template>

<script setup lang="ts">
import type { ComputedRef } from 'vue';

import { injectOrFail } from '@/framework/utils/vue';
import type Form from '@/framework/forms/Form';

const form = injectOrFail<Form>('form');
</script>
