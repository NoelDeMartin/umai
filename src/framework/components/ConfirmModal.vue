<template>
    <AppModal v-slot="{ close }" :cancellable="false">
        <CoreMarkdown :text="message || $t('ui.confirm')" />
        <div class="flex flex-row-reverse items-end mt-4 space-x-2 space-x-reverse">
            <CoreButton color="danger" @click="close(true)">
                {{ acceptText || $t('ui.confirm_accept') }}
            </CoreButton>
            <CoreButton clear @click="close(false)">
                {{ cancelText || $t('ui.confirm_cancel') }}
            </CoreButton>
        </div>
    </AppModal>
</template>

<script setup lang="ts">
import { stringProp } from '@/framework/utils/vue';

defineProps({
    message: stringProp(),
    acceptText: stringProp(),
    cancelText: stringProp(),
});
</script>
