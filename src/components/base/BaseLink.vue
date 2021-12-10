<template>
    <router-link :to="{ name: route }" class="text-primary-600 hover:text-primary-500 hover:underline">
        <slot />
    </router-link>
</template>

<script setup lang="ts">
defineProps({
    route: {
        type: String,
        required: true,
    },
});
</script>
