<template>
    <div id="app-layout" ref="$root" class="flex flex-col min-w-screen min-h-screen overflow-x-hidden print:block">
        <AppHeader v-if="!$errors.hasStartupErrors && ($route.meta.header ?? true)" />
        <div class="flex flex-col flex-grow self-stretch items-center print:block">
            <slot />
        </div>
        <AppFooter v-if="$route.meta.footer ?? true" />
        <AppOverlays />

        <div id="element-transitions-container" />
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

import UI from '@/framework/core/facades/UI';

const $root = $ref<HTMLElement | null>(null);
const headerHeight = $computed(() => `${UI.headerHeight}px`);

onMounted(() => $root && UI.setLayoutElement($root));
</script>

<style>
#app-layout {
    --header-height: v-bind(headerHeight);
}
</style>
