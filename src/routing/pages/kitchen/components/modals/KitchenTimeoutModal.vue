<template>
    <AppModal :title="$t('kitchen.timers.timeout.title')">
        <KitchenTimer :timer="timer" />
    </AppModal>
</template>

<script setup lang="ts">
import { requiredObjectProp } from '@/framework/utils/vue';

import type Timer from '@/models/Timer';

defineProps({ timer: requiredObjectProp<Timer>() });
</script>
