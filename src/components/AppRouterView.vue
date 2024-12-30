<template>
    <router-view v-slot="{ Component, route }">
        <Transition @enter="onEnter" @leave="onLeave">
            <component :is="Component" :key="route.path" />
        </Transition>
    </router-view>
</template>

<script setup lang="ts">
import Router from '@/framework/core/facades/Router';
import type { AppRouteMeta } from '@/framework/routing/router';

function onEnter(element: Element, done: () => void) {
    const meta = Router.currentRoute.value.meta as AppRouteMeta;
    const entered = meta.enter?.(element as HTMLElement) ?? Promise.resolve();

    entered.then(() => done());
}

function onLeave(element: Element, done: () => void) {
    const meta = Router.previousRoute?.meta as AppRouteMeta | undefined;
    const left = meta?.leave?.(element as HTMLElement) ?? Promise.resolve();

    left.then(() => done());
}
</script>
