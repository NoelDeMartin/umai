<template>
    <div ref="$root" class="flex flex-col min-w-screen min-h-screen overflow-x-hidden">
        <AppHeader v-if="!$errors.hasStartupErrors && ($route.meta.header ?? true)" />
        <div class="flex flex-col flex-grow self-stretch items-center">
            <slot />
        </div>
        <AppFooter />
        <AppOverlays />

        <div id="element-transitions-container" />
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

import UI from '@/framework/core/facades/UI';

const $root = $ref<HTMLElement | null>(null);

onMounted(() => $root && UI.setLayoutElement($root));
</script>
