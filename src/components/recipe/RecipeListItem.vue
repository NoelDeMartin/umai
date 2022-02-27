<template>
    <div class="flex overflow-hidden bg-gray-100 rounded-lg border-gray-200 shadow">
        <RecipeImage :url="imageUrl" class="w-40 h-40" />
        <div class="overflow-y-auto p-4 h-40 prose">
            <h3 class="mb-0">
                {{ name }}
            </h3>
            <p v-if="description" class="overflow-y-auto mt-1">
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
