<template>
    <AppHeaderButton @click="$ui.openModal(CloudStatusModal)">
        <div role="status" class="flex justify-center items-center space-x-2">
            <div class="relative w-8 h-8" aria-hidden="true">
                <i-zondicons-cloud class="absolute inset-0 w-full h-full" />
                <div
                    class="flex absolute inset-0 justify-center items-center transition-colors duration-700"
                    :class="$route.meta.fullBleedHeader ? 'text-gray-900' : 'text-white'"
                >
                    <i-pepicons-refresh v-if="$cloud.syncing" class="w-4 h-4 animate-spin" />
                    <span v-else-if="$cloud.offline">!</span>
                    <i-pepicons-times v-else-if="$cloud.disconnected" class="w-4 h-4" />
                    <template v-else-if="$cloud.online">
                        <span v-if="$cloud.dirty" class="text-xs">{{ pendingUpdates.badge }}</span>
                        <i-pepicons-checkmark v-else class="w-4 h-4" />
                    </template>
                </div>
            </div>
            <span class="sr-only sm:not-sr-only">{{ $t(`cloud.statuses.${$cloud.status}`) }}</span>
            <span v-if="$cloud.syncing" class="sr-only">{{ $t('cloud.statuses.syncing_description') }}</span>
            <span v-else class="sr-only">{{ pendingUpdates.a11y }}</span>
        </div>
    </AppHeaderButton>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import Cloud from '@/framework/core/facades/Cloud';

import CloudStatusModal from '@/components/modals/CloudStatusModal.vue';

const { t } = useI18n();
const pendingUpdates = $computed(() => {
    if (!Cloud.dirty)
        return { badge: null, a11y: t('cloud.noPendingUpdates_a11y') };

    if (Cloud.pendingUpdates.length > 9)
        return { badge: '9+', a11y: t('cloud.manyPendingUpdates_a11y') };

    return {
        badge: Cloud.pendingUpdates.length,
        a11y: t('cloud.somePendingUpdates_a11y', Cloud.pendingUpdates.length),
    };
});
</script>
