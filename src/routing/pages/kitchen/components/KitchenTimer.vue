<template>
    <div class="flex p-4 rounded flex-col bg-gray-100">
        <div class="flex flex-row justify-between" :class="{ 'text-red-700': timer.isOverTime() }">
            <h3 class="font-semibold">
                {{ timer.name }}
            </h3>
            <span class="text-sm">
                {{ time }}
            </span>
        </div>
        <div v-if="timer.hasStarted() && !timer.isOverTime()" class="w-full h-2 mt-2 rounded-full bg-gray-200 relative">
            <div
                class="h-full rounded-full absolute left-0 top-0"
                :style="`width: ${timer.getTimeLeft() * 100 / timer.duration}%`"
                :class="{
                    'bg-primary-500': !timer.isPaused(),
                    'bg-gray-400': timer.isPaused(),
                }"
            />
        </div>
        <div class="flex space-x-2 mt-4 self-end">
            <CoreButton
                v-if="!timer.isRunning()"
                secondary
                class="self-end"
                @click="timer.play()"
            >
                <i-pepicons-play class="w-4 h-4" aria-hidden="true" />
                <span class="ml-1 text-xs uppercase font-medium">
                    {{ timer.isPaused() ? $t('kitchen.timers.resume') : $t('kitchen.timers.play') }}
                </span>
            </CoreButton>
            <CoreButton
                v-else-if="!timer.isOverTime()"
                secondary
                class="self-end"
                @click="timer.pause()"
            >
                <i-pepicons-pause class="w-4 h-4" aria-hidden="true" />
                <span class="ml-1 text-xs uppercase font-medium">
                    {{ $t('kitchen.timers.pause') }}
                </span>
            </CoreButton>
            <CoreButton
                v-else
                secondary
                class="self-end"
                @click="timer.stop()"
            >
                <i-tabler-player-stop-filled class="w-4 h-4" aria-hidden="true" />
                <span class="ml-1 text-xs uppercase font-medium">
                    {{ $t('kitchen.timers.stop') }}
                </span>
            </CoreButton>
            <CoreButton
                v-if="timer.isPaused()"
                secondary
                rounded
                class="self-end"
                @click="timer.stop()"
            >
                <i-tabler-player-stop-filled class="w-4 h-4" aria-hidden="true" />
                <span class="ml-1 text-xs uppercase font-medium">
                    {{ $t('kitchen.timers.stop') }}
                </span>
            </CoreButton>
            <CoreButton
                secondary
                rounded
                class="self-end"
                :title="$t('kitchen.timers.delete')"
                @click="$kitchen.removeTimer(timer)"
            >
                <i-pepicons-trash class="w-4 h-4" aria-hidden="true" />
                <span class="sr-only">
                    {{ $t('kitchen.timers.delete') }}
                </span>
            </CoreButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

import { requiredObjectProp } from '@/framework/utils/vue';

import { setFrameInterval } from '@/utils/intervals';
import type Timer from '@/models/Timer';

const props = defineProps({
    timer: requiredObjectProp<Timer>(),
});

let clearFrameInterval: Function | null = null;
let clearListener: Function | null = null;
const now = ref<number | null>(null);
const time = computed(() => {
    let prefix = '';
    let timeLeft = props.timer.getTimeLeft(now.value ?? undefined);

    if (timeLeft < 0) {
        prefix = '-';
        timeLeft = -timeLeft + 1000;
    }

    const seconds = Math.floor(timeLeft / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    return prefix + [formatDigit(hours), formatDigit(minutes % 60), formatDigit(seconds % 60)].join(':');
});

function formatDigit(value: number, length: number = 2) {
    return value.toString().padStart(length, '0');
}

function startWatching(): void {
    if (clearFrameInterval) {
        return;
    }

    now.value = Date.now();
    clearFrameInterval = setFrameInterval(() => now.value = Date.now());
}

function stopWatching(): void {
    if (!clearFrameInterval) {
        return;
    }

    clearFrameInterval();

    clearFrameInterval = null;
    now.value = null;
}

onMounted(() => {
    clearListener = props.timer.listeners.add({
        onStartedRunning: () => startWatching(),
        onStoppedRunning: () => stopWatching(),
    });

    if (props.timer.isRunning()) {
        startWatching();
    }
});

onUnmounted(() => {
    clearListener?.();
    stopWatching();
});
</script>
