<template>
    <AppHeaderButton @click="$ui.openModal(CloudStatusModal)">
        <div role="status" class="flex justify-center items-center space-x-2">
            <div class="relative w-8 h-8" aria-hidden="true">
                <i-zondicons-cloud
                    class="absolute inset-0 w-full h-full"
                    :class="{
                        'transition-colors duration-700': $cloud.online,
                        'text-red-600': $auth.error,
                        'text-green-400': $cloud.online && !$route.meta.fullBleedHeader,
                        'text-white': $cloud.online && $route.meta.fullBleedHeader,
                    }"
                    aria-hidden="true"
                />
                <div
                    class="flex absolute inset-0 justify-center items-center transition-colors duration-700"
                    :class="{
                        'text-gray-900': $route.meta.fullBleedHeader,
                        'text-green-900': !$route.meta.fullBleedHeader && $cloud.online,
                        'text-white': !$route.meta.fullBleedHeader && !$cloud.online,
                    }"
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

import Auth from '@/framework/core/facades/Auth';
import Cloud from '@/framework/core/facades/Cloud';

import CloudStatusModal from '@/components/modals/CloudStatusModal.vue';

const { t } = useI18n();
const pendingUpdates = $computed(() => {
    if (!Cloud.dirty)
        return { badge: null, a11y: t('cloud.noPendingUpdates_a11y') };

    const updatesCount = Auth.loggedIn
        ? Cloud.pendingUpdates.length
        : Object.values(Cloud.offlineModelUpdates).reduce((total, count) => total + count);

    if (updatesCount > 9)
        return { badge: '9+', a11y: t('cloud.manyPendingUpdates_a11y') };

    return {
        badge: updatesCount,
        a11y: t('cloud.somePendingUpdates_a11y', updatesCount),
    };
});
</script>
