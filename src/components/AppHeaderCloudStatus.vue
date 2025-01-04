<template>
    <AppHeaderButton @click="$ui.openModal(CloudStatusModal)">
        <div
            role="status"
            class="flex justify-center items-center space-x-2"
            :class="{ 'opacity-75': $auth.hasLoggedIn && $cloud.disconnected }"
        >
            <div class="relative w-8 h-8" aria-hidden="true">
                <i-zondicons-cloud
                    class="absolute inset-0 w-full h-full"
                    :class="{ 'text-red-600': $auth.error }"
                    aria-hidden="true"
                />
                <div
                    class="flex absolute inset-0 justify-center items-center"
                    :class="[
                        value($route.meta.fullBleedHeader) ? 'text-gray-900' : 'text-white',
                        $ui.animations ? 'transition-colors duration-700' : '',
                    ]"
                >
                    <i-pepicons-refresh v-if="$cloud.syncing" class="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span v-else-if="$cloud.offline">!</span>
                    <i-pepicons-exclamation v-else-if="$auth.error" class="w-3 h-3" aria-hidden="true" />
                    <i-pepicons-times v-else-if="!$auth.hasLoggedIn && $cloud.disconnected" class="w-4 h-4" aria-hidden="true" />
                    <span v-else-if="$cloud.dirty" class="text-xs">{{ pendingUpdates.badge }}</span>
                    <i-pepicons-checkmark v-else class="w-4 h-4" aria-hidden="true" />
                </div>
            </div>
            <span class="sr-only sm:not-sr-only">{{ $t(`cloud.statuses.${$cloud.status}`) }}</span>
            <span v-if="$cloud.syncing" class="sr-only">{{ $t('cloud.statuses.syncing_description') }}</span>
            <span v-else-if="$auth.error" class="sr-only">{{ $t('cloud.statuses.authError_description') }}</span>
            <span v-else class="sr-only">{{ pendingUpdates.a11y }}</span>
        </div>
    </AppHeaderButton>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { value } from '@noeldemartin/utils';

import Cloud from '@/framework/core/facades/Cloud';

import CloudStatusModal from '@/components/modals/CloudStatusModal.vue';

const { t } = useI18n();
const pendingUpdates = $computed(() => {
    if (!Cloud.dirty)
        return { badge: null, a11y: t('cloud.pendingUpdates_a11y', 0) };

    if (Cloud.pendingUpdates > 9)
        return { badge: '9+', a11y: t('cloud.manyPendingUpdates_a11y') };

    return {
        badge: Cloud.pendingUpdates,
        a11y: t('cloud.pendingUpdates_a11y', Cloud.pendingUpdates),
    };
});
</script>
