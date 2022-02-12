<template>
    <HeadlessButton class="flex flex-col justify-center items-center p-4 w-40 h-40 bg-gray-200 hover:bg-gray-300 active:bg-gray-300">
        <slot className="w-12 h-12 text-gray-500" />
        <span class="mt-2 text-lg font-medium text-center text-gray-700">{{ label }}</span>
    </HeadlessButton>
</template>

<script setup lang="ts">
defineProps({
    label: {
        type: String,
        required: true,
    },
});
</script>
