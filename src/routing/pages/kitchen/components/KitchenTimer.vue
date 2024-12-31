<template>
    <div class="flex w-96 mb-4">
        <div>
            <h3 class="font-semibold">
                {{ timer.name }}
            </h3>
            <span class="text-sm" :class="{ 'text-red-700': timer.isOverTime() }">
                {{ time }}
            </span>
        </div>

        <div class="flex-grow" />

        <div class="flex space-x-2">
            <CoreButton
                v-if="!timer.isRunning()"
                secondary
                class="self-end"
                @click="timer.start()"
            >
                <i-pepicons-play class="w-4 h-4" aria-hidden="true" />
                <span class="ml-1 text-xs uppercase font-medium">
                    {{ $t('kitchen.timers.start') }}
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
                secondary
                rounded
                class="self-end"
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

import type Timer from '@/models/Timer';

const props = defineProps({
    timer: requiredObjectProp<Timer>(),
});

let interval: ReturnType<typeof setInterval> | null = null;
let clearListener: Function | null = null;
const pad = (value: number, length: number = 2) => value.toString().padStart(length, '0');
const now = ref<number | null>(null);
const time = computed(() => {
    let prefix = '';
    let timeLeft = props.timer.duration;

    if (now.value && props.timer.startedAt) {
        timeLeft -= Math.round(now.value - props.timer.startedAt.getTime());
    }

    if (timeLeft < 0) {
        prefix = '-';
        timeLeft *= -1;
    }

    const seconds = Math.floor(timeLeft / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    return prefix + [pad(hours), pad(minutes % 60), pad(seconds % 60)].join(':');
});

function startWatching(): void {
    if (interval) {
        return;
    }

    now.value = Date.now();
    interval = setInterval(() => now.value = Date.now(), 1000);
}

function stopWatching(): void {
    if (!interval) {
        return;
    }

    clearInterval(interval);

    interval = null;
    now.value = null;
}

onMounted(() => {
    clearListener = props.timer.listeners.add({
        onStarted: () => startWatching(),
        onStopped: () => stopWatching(),
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
