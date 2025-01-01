<template>
    <AppModal>
        <template #title>
            <div class="flex items-center">
                <i-pepicons-alarm class="w-8 h-8" aria-hidden="true" />
                <span class="ml-2">{{ $t('kitchen.timers.timeout.title') }}</span>
            </div>
        </template>
        <template #default="{ close }">
            <CoreMarkdown class="text-gray-700" :text="$t('kitchen.timers.timeout.description', { name: timer.name })" />
            <CoreButton class="self-center mt-2" @click="timer.stop(), close()">
                <i-tabler-player-stop-filled class="w-4 h-4" aria-hidden="true" />
                <span class="ml-1 text-xs uppercase font-medium">
                    {{ $t('kitchen.timers.timeout.stop') }}
                </span>
            </CoreButton>
        </template>
    </AppModal>
</template>

<script setup lang="ts">
import { requiredObjectProp } from '@/framework/utils/vue';

import type Timer from '@/models/Timer';

defineProps({ timer: requiredObjectProp<Timer>() });
</script>
