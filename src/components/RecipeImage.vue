<template>
    <div class="flex justify-center items-center bg-gray-200">
        <i-zondicons-photo class="w-full h-2/5 opacity-25" />
        <div
            v-if="url"
            class="absolute inset-0 bg-center bg-cover"
            :style="`background-image: url('${url}')`"
        />
    </div>
</template>

<script setup lang="ts">
defineProps({
    url: {
        type: String,
        default: null,
    },
});
</script>
