<template>
    <div :class="`flex justify-center items-center bg-gray-200 ${extraClasses}`">
        <i-zondicons-photo class="w-full h-2/5 opacity-25" />
        <div
            v-if="url"
            class="absolute inset-0 bg-center bg-cover"
            :style="`background-image: url('${url}')`"
        />
    </div>
</template>

<script setup lang="ts">
const { class: classProp } = defineProps({
    url: {
        type: String,
        default: null,
    },
    class: {
        type: String,
        default: '',
    },
});

const extraClasses = $computed(() => classProp.includes('absolute') ? classProp : `${classProp} relative`);
</script>
