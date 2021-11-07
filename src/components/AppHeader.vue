<template>
    <header
        ref="header"
        class="flex z-10 flex-col items-center self-stretch p-8"
        :class="{ 'text-white bg-gradient-to-b to-transparent from-dark-overlay': $ui.fullBleedHeader }"
    >
        <div class="flex relative z-10 justify-between items-center w-full max-w-content">
            <div class="flex">
                <router-link
                    :to="{ name: 'home' }"
                    title="Umai"
                    class="flex justify-center items-center space-x-2"
                >
                    <i-twemoji-steaming-bowl class="w-12 h-12" />
                    <span>Umai</span>
                </router-link>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from '@vue/runtime-core';

import UI from '@/framework/core/facades/UI';

function updateHeaderSize() {
    UI.updateHeaderHeight(header.value.clientHeight);
}

const header = ref<HTMLElement>(null as unknown as HTMLElement);
const resizeObserver = new ResizeObserver(() => updateHeaderSize());

onMounted(() => {
    updateHeaderSize();
    resizeObserver.observe(header.value);
});
onUnmounted(() => resizeObserver.disconnect());
</script>
