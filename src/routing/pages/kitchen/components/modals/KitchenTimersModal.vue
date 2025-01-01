<template>
    <AppModal :title="$t('kitchen.timers.title')">
        <CoreMarkdown :text="$t('kitchen.timers.description')" class="text-gray-700 text-sm w-96" />

        <ul v-if="$kitchen.timers.length > 0" class="mt-4 [&>li:not(:last-child)]:mb-3">
            <li v-for="(timer, index) of $kitchen.timers" :key="index">
                <KitchenTimer :timer="timer" />
            </li>
        </ul>

        <CoreButton secondary class="self-end mt-4" @click="$ui.openModal(KitchenAddTimerModal)">
            <i-pepicons-plus class="w-5 h-5" aria-hidden="true" />
            <span class="ml-1">{{ $t('kitchen.timers.add') }}</span>
        </CoreButton>
    </AppModal>
</template>

<script setup lang="ts">
import KitchenAddTimerModal from './KitchenAddTimerModal.vue';
</script>
