<template>
    <form @submit.prevent="submit()">
        <slot />
    </form>
</template>

<script setup lang="ts">
import { provide } from 'vue';
import type { PropType } from 'vue';

import type Form from '@/framework/forms/Form';

const { form } = defineProps({
    form: {
        type: Object as PropType<Form>,
        required: true,
    },
});
const emit = defineEmits(['submit']);

provide('form', form);

async function submit() {
    if (!form.submit())
        return;

    emit('submit', form.data());
}
</script>
