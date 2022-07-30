<template>
    <HeadlessButton
        class="fixed bottom-edge right-edge z-10 flex justify-center items-center text-white rounded-full shadow-lg bg-primary-600 w-16 h-16 hover:bg-primary-700 active:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-600"
        :aria-label="$t('home.recipes.create')"
        :title="$t('home.recipes.create')"
        @click="$ui.openModal(CreateRecipeModal)"
    >
        <i-pepicons-plus class="w-8 h-8" aria-hidden="true" />
    </HeadlessButton>
</template>

<script setup lang="ts">
import CreateRecipeModal from '@/components/modals/CreateRecipeModal.vue';
</script>
