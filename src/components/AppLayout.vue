<template>
    <div class="flex h-screen w-screen flex-col overflow-y-auto">
        <AppHeader v-if="$route.meta.header ?? true" />
        <div class="mb-edge flex flex-grow justify-center self-stretch">
            <slot />
        </div>
        <AppFooter />
        <AppOverlays />

        <div id="element-transitions-container" />
    </div>
</template>

<script setup lang="ts"></script>
