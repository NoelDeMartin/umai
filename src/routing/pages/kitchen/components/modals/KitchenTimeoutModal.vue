<template>
    <AppModal>
        <template #title>
            <div class="flex items-center">
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
    if (!$audio.value) {
        return;
    }

    for (let i = 0; i < 10; i++) {
        $audio.value.volume = 0.1 * i;

        await after({ seconds: 2.5 });
    }
});

onMounted(() => props.timer.stop());
</script>
