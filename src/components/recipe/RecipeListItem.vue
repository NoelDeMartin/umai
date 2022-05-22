<template>
    <div
        class="flex overflow-hidden rounded-lg border-gray-200 bg-gray-100 shadow"
    >
        <RecipeImage :url="imageUrl" class="h-40 w-40" />
        <div class="prose h-40 overflow-y-auto p-4">
            <h3 class="mb-0">
                {{ name }}
            </h3>
            <p v-if="description" class="mt-1 overflow-y-auto">
                {{ description }}
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: null,
    },
    imageUrl: {
        type: String,
        default: null,
    },
});
</script>
