<template>
    <header
        ref="header"
        class="flex relative z-40 flex-col items-center self-stretch p-8 transition-colors duration-700"
        :class="{ 'text-white': $ui.fullBleedHeader }"
    >
        <div class="flex relative z-10 justify-between items-center w-full max-w-content">
            <div class="relative flex-grow h-full">
                <transition
                    enter-active-class="transition duration-700"
                    :enter-from-class="enterFromClasses"
                    enter-to-class="opacity-100"
                    leave-active-class="transition duration-700"
                    leave-from-class="opacity-100"
                    :leave-to-class="leaveToClasses"
                >
                    <div v-if="$route.name !== 'recipes.show'" class="flex absolute left-0 top-1/2 w-full text-gray-900 transform -translate-y-1/2">
                        <router-link
                            :to="{ name: 'home' }"
                            title="Umai"
                            class="flex justify-center items-center space-x-2"
                        >
                            <i-twemoji-steaming-bowl class="mr-2 w-12 h-12" />
                            <span class="text-xl">Umai</span>
                        </router-link>
                    </div>
                    <button
                        v-else
                        type="button"
                        class="flex absolute left-0 top-1/2 items-center w-full text-white transform -translate-y-1/2"
                        @click="$router.push({ name: 'recipes.index' })"
                    >
                        <i-zondicons-arrow-thin-left class="mr-2 w-4 h-4" /> back to cookbook
                    </button>
                </transition>
            </div>
            <div class="flex space-x-2">
                <CloudStatus />
                <UserMenu />
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

import Router from '@/framework/core/facades/Router';
import UI from '@/framework/core/facades/UI';

function updateHeaderSize() {
    UI.updateHeaderHeight(header.value.clientHeight);
}

const header = ref<HTMLElement>(null as unknown as HTMLElement);
const resizeObserver = new ResizeObserver(() => updateHeaderSize());
const enterFromClasses = computed(() => [
    'opacity-0',
    Router.currentRoute.value.name === 'recipes.show' ? 'translate-x-full' : '-translate-x-full',
].join(' '));
const leaveToClasses = computed(() => [
    'opacity-0',
    Router.currentRoute.value.name === 'recipes.show' ? '-translate-x-full' : 'translate-x-full',
].join(' '));

onMounted(() => {
    updateHeaderSize();
    resizeObserver.observe(header.value);
});
onUnmounted(() => resizeObserver.disconnect());
</script>
