<template>
    <header
        ref="header"
        class="flex relative z-40 flex-col items-center self-stretch p-8 h-24 transition-colors duration-700 shrink-0"
        :class="{ 'text-white': $route.meta.fullBleedHeader }"
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
                    <div v-if="!$route.meta.fullBleedHeader" class="flex absolute left-0 top-1/2 w-full text-gray-900 -translate-y-1/2">
                        <router-link
                            :to="{ name: 'home' }"
                            title="Umai"
                            class="flex justify-center items-center space-x-2"
                        >
                            <i-twemoji-steaming-bowl class="mr-2 w-12 h-12" />
                            <span class="text-xl">Umai</span>
                        </router-link>
                    </div>
                    <!-- TODO investigate inferring previous route after a reload, instead of defaulting to home -->
                    <button
                        v-else
                        type="button"
                        class="flex absolute left-0 top-1/2 items-center w-full text-white -translate-y-1/2"
                        @click="$router.previousRoute ? $router.back() : $router.push({ name: 'home' })"
                    >
                        <span aria-hidden="true" class="mr-2">&larr; </span>
                        <span v-if="$router.previousRouteWas('recipes.index')">{{ $t('recipes.index.back') }}</span>
                        <span v-else>{{ $t('home.back') }}</span>
                    </button>
                </transition>
            </div>
            <div class="flex space-x-2">
                <CloudStatus v-if="!$auth.dismissed" />
                <UserMenu />
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

import Router from '@/framework/core/facades/Router';
import UI from '@/framework/core/facades/UI';

function updateHeaderSize() {
    if (!header)
        return;

    UI.updateHeaderHeight(header.clientHeight);
}

const header = $ref<HTMLElement>();
const resizeObserver = new ResizeObserver(() => updateHeaderSize());
const enterFromClasses = $computed(() => [
    'opacity-0',
    Router.currentRouteIs('recipes.show') ? 'translate-x-full' : '-translate-x-full',
].join(' '));
const leaveToClasses = $computed(() => [
    'opacity-0',
    Router.currentRouteIs('recipes.show') ? '-translate-x-full' : 'translate-x-full',
].join(' '));

onMounted(() => {
    if (!header)
        return;

    updateHeaderSize();
    resizeObserver.observe(header);
});
onUnmounted(() => resizeObserver.disconnect());
</script>
