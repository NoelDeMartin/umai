<template>
    <div class="relative w-8 h-8">
        <i-zondicons-cloud class="absolute inset-0 w-full h-full" />
        <div class="flex absolute inset-0 justify-center items-center text-white">
            <i-zondicons-refresh v-if="$cloud.syncing" class="w-3 h-3 animate-spin" />
            <i-zondicons-minus-solid v-else-if="$cloud.offline" class="w-3 h-3" />
            <i-zondicons-question v-else-if="$cloud.disconnected" class="w-3 h-3" />
            <template v-else-if="$cloud.online">
                <span v-if="$cloud.dirty" class="text-sm">{{ pendingUpdates }}</span>
                <i-zondicons-checkmark v-else class="w-3 h-3" />
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from '@vue/runtime-core';

import Cloud from '@/framework/core/facades/Cloud';

const pendingUpdates = computed(() => {
    if (!Cloud.dirty)
        return null;

    if (Cloud.pendingUpdates.length > 9)
        return '9+';

    return Cloud.pendingUpdates.length;
});
</script>
