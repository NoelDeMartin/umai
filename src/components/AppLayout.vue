<template>
    <div class="flex overflow-y-auto flex-col w-screen h-screen">
        <AppHeader />
        <div class="flex flex-grow justify-center self-stretch mb-edge">
            <slot />
        </div>
        <AppFooter />
        <AppOverlays />

        <div id="element-transitions-container" />
    </div>
</template>

<script setup lang="ts"></script>
