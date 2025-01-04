<template>
    <AppModal>
        <template #title>
            <div class="flex items-center animate-shake">
                <i-pepicons-alarm class="w-8 h-8" aria-hidden="true" />
                <span class="ml-2">{{ $t('kitchen.timers.timeout.title') }}</span>
            </div>
        </template>
        <CoreMarkdown class="text-gray-700" :text="$t('kitchen.timers.timeout.description', { name: timer.name })" />
        <audio
            ref="$audio"
            autoplay
            loop
            volume="0"
        >
            <source src="@/assets/sounds/timer.mp3" type="audio/mpeg">
        </audio>
    </AppModal>
</template>

<script setup lang="ts">
import { after } from '@noeldemartin/utils';
import { onMounted, ref, watch } from 'vue';

import { requiredObjectProp } from '@/framework/utils/vue';

import type Timer from '@/models/Timer';

const props = defineProps({ timer: requiredObjectProp<Timer>() });
const $audio = ref<HTMLAudioElement | null>(null);

watch($audio, async () => {
    for (let i = 0; i < 10; i++) {
        if (!$audio.value) {
            return;
        }

        $audio.value.volume = 0.1 * i;

        await after({ seconds: 2.5 });
    }
});

onMounted(() => props.timer.stop());
</script>

<style>
.animate-shake {
    animation: shake 2510ms linear infinite;
}

@keyframes shake {
    0% { transform: translate(1px, 1px) rotate(0deg); }
    5% { transform: translate(-1px, -2px) rotate(-1deg); }
    10% { transform: translate(-3px, 0px) rotate(1deg); }
    15% { transform: translate(3px, 2px) rotate(0deg); }
    20% { transform: translate(1px, -1px) rotate(1deg); }
    25% { transform: translate(-1px, 2px) rotate(-1deg); }
    30% { transform: translate(-3px, 1px) rotate(0deg); }
    35% { transform: translate(3px, 1px) rotate(-1deg); }
    40% { transform: translate(-1px, -1px) rotate(1deg); }
    45% { transform: translate(1px, 2px) rotate(0deg); }
    50% { transform: translate(1px, -2px) rotate(-1deg); }
    100% { transform: translate(0, 0) rotate(0); }
}
</style>
