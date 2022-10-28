<template>
    <AppModal v-slot="{ close }" :cancellable="false">
        <h2 v-if="title" class="text-xl font-semibold">
            {{ title }}
        </h2>
        <CoreMarkdown class="mt-2" :text="message || $t('ui.confirm')" />
        <div class="flex flex-row-reverse items-end space-x-2 space-x-reverse mt-4">
            <CoreButton v-initial-focus :color="acceptColor" @click="close(true)">
                {{ acceptText || $t('ui.confirm_accept') }}
            </CoreButton>
            <CoreButton v-if="showCancel" clear @click="close(false)">
                {{ cancelText || $t('ui.confirm_cancel') }}
            </CoreButton>
        </div>
    </AppModal>
</template>

<script setup lang="ts">
import { booleanProp, enumProp, stringProp } from '@/framework/utils/vue';

import { CoreColor } from '@/components/core';

defineProps({
    title: stringProp(),
    message: stringProp(),
    acceptText: stringProp(),
    acceptColor: enumProp(CoreColor),
    cancelText: stringProp(),
    showCancel: booleanProp(true),
});
</script>
