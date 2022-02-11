<template>
    <HeadlessButton class="flex relative items-center h-16 group">
        <div class="flex z-10 items-center ml-8 text-lg font-medium text-white">
            <slot />
        </div>
        <svg
            preserveAspectRatio="none"
            viewBox="0 0 98.937 28.767"
            class="absolute inset-0 w-full h-full text-gray-400 fill-current group-hover:text-primary-500"
        >
            <path d="M3.364 5.181C.48 9.044.876 20.123 0 28.767c49.979-6.653 90.084-3.253 94.75-.992 2.663 1.29 6.305-19.232 2.633-23.04-8.436-8.748-91.136-3.417-94.02.446Z" />
        </svg>
    </HeadlessButton>
</template>

<script setup lang="ts"></script>
