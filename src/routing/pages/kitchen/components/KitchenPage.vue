<template>
    <div class="fixed inset-0 bg-white z-40">
        <CoreButton
            clear
            class="absolute right-4 top-4 md:right-8 md:top-8"
            :title="$t('kitchen.close')"
            @click="$kitchen.close()"
        >
            <i-pepicons-times class="w-8 h-8" aria-hidden="true" />
            <span class="sr-only">{{ $t('kitchen.close') }}</span>
        </CoreButton>

        <div class="w-full h-full overflow-auto">
            <div class="mx-auto max-w-4xl pt-8 pb-8 px-edge md:pt-16">
                <h1 class="text-2xl font-semibold">
                    {{ title }}
                </h1>

                <slot />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { requiredStringProp } from '@/framework/utils/vue';

defineProps({
    title: requiredStringProp(),
});
</script>
