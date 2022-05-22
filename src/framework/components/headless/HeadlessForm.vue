<template>
    <form @submit.prevent="submit()">
        <slot />
    </form>
</template>

<script setup lang="ts">
import { provide } from 'vue';

import { requiredObjectProp } from '@/framework/utils/vue';
import type Form from '@/framework/forms/Form';

const { form } = defineProps({
    form: requiredObjectProp<Form>(),
});
const emit = defineEmits(['submit']);

provide('form', form);

async function submit() {
    if (!form.submit()) return;

    emit('submit', form.data());
}
</script>
