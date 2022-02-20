<template>
    <!-- TODO Use focus-visible polyfill? https://tailwindcss.com/docs/hover-focus-and-other-states#focus-visible -->
    <button
        type="button"
        class="rounded px-2 hover:bg-[rgba(0,0,0,.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:ring-indigo-600"
        @click="$ui.openModal(CloudStatusModal)"
    >
        <div role="status" class="flex justify-center items-center space-x-2">
            <div class="relative w-8 h-8">
                <i-zondicons-cloud class="absolute inset-0 w-full h-full" />
                <div
                    class="flex absolute inset-0 justify-center items-center transition-colors duration-700"
                    :class="$route.meta.fullBleedHeader ? 'text-gray-900' : 'text-white'"
                >
                    <i-zondicons-refresh v-if="$cloud.syncing" class="w-3 h-3 animate-spin" />
                    <i-zondicons-minus-solid v-else-if="$cloud.offline" class="w-3 h-3" />
                    <i-zondicons-close v-else-if="$cloud.disconnected" class="w-2 h-2" />
                    <template v-else-if="$cloud.online">
                        <span v-if="$cloud.dirty" class="text-sm">{{ pendingUpdates.badge }}</span>
                        <i-zondicons-checkmark v-else class="w-3 h-3" />
                    </template>
                </div>
            </div>
            <span class="sr-only sm:not-sr-only">{{ $t(`cloud.statuses.${$cloud.status}`) }}</span>
            <span class="sr-only">{{ pendingUpdates.a11y }}</span>
        </div>
    </button>
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
