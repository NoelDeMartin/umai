<template>
    <AppModal>
        <template #title>
            <div class="flex items-center">
                <i-pepicons-alarm class="w-8 h-8" aria-hidden="true" />
                <span class="ml-2">{{ $t('kitchen.timers.timeout.title') }}</span>
            </div>
        </template>
        <CoreMarkdown class="text-gray-700" :text="$t('kitchen.timers.timeout.description', { name: timer.name })" />
    </AppModal>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

import { requiredObjectProp } from '@/framework/utils/vue';

import type Timer from '@/models/Timer';

const props = defineProps({ timer: requiredObjectProp<Timer>() });

onMounted(() => props.timer.stop());
</script>
