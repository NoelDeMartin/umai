<template>
    <!-- TODO story & styles -->
    <router-link
        :to="{ name: route }"
        class="inline-flex justify-center items-center px-4 py-2 text-base font-medium text-white whitespace-nowrap bg-origin-border bg-gradient-to-r from-purple-600 to-indigo-600 rounded-md border border-transparent shadow-sm hover:from-purple-700 hover:to-indigo-700"
    >
        <slot />
    </router-link>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

defineProps({
    route: {
        type: String,
        required: true,
    },
});
</script>
