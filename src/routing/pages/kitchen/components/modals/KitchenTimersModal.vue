<template>
    <AppModal :title="$t('kitchen.timers.title')">
        <CoreMarkdown :text="$t('kitchen.timers.description')" class="text-gray-700 text-sm max-w-sm" />

        <ul v-if="$kitchen.timers.length > 0" class="mt-5 [&>li:not(:last-child)]:mb-5">
            <li v-for="(timer, index) of $kitchen.timers" :key="index">
                <KitchenTimer :timer="timer" />
            </li>
        </ul>

        <CoreButton class="self-center mt-6" secondary @click="$ui.openModal(KitchenAddTimerModal)">
            <i-pepicons-plus class="w-5 h-5" aria-hidden="true" />
            <span class="ml-1">{{ $t('kitchen.timers.add') }}</span>
        </CoreButton>
    </AppModal>
</template>

<script setup lang="ts">
import KitchenAddTimerModal from './KitchenAddTimerModal.vue';
</script>
