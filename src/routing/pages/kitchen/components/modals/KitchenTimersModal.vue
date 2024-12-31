<template>
    <AppModal :title="$t('kitchen.timers.title')">
        <ul>
            <li v-for="(timer, index) of $kitchen.timers" :key="index">
                <KitchenTimer :timer="timer" />
            </li>
        </ul>

        <CoreButton secondary class="self-center" @click="$ui.openModal(KitchenAddTimerModal)">
            <i-pepicons-plus class="w-5 h-5" aria-hidden="true" />
            <span class="ml-1">{{ $t('kitchen.timers.add') }}</span>
        </CoreButton>
    </AppModal>
</template>

<script setup lang="ts">
import KitchenAddTimerModal from './KitchenAddTimerModal.vue';
</script>
