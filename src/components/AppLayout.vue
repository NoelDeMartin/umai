<template>
    <div ref="$root" class="flex overflow-y-auto flex-col w-screen h-screen">
        <AppHeader v-if="!$errors.hasStartupErrors && ($route.meta.header ?? true)" />
        <div class="flex flex-grow justify-center self-stretch">
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
