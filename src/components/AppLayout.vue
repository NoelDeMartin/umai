<template>
    <div class="flex overflow-y-auto flex-col w-screen h-screen text-base antialiased font-normal leading-tight text-gray-900">
        <AppHeader />
        <div class="flex flex-grow justify-center self-stretch mb-edge">
            <slot />
        </div>
        <AppFooter />
        <AppModals />
        <div id="element-transitions-container" />
    </div>
</template>

<script setup lang="ts"></script>
