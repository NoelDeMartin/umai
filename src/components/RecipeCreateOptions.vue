<template>
    <div class="flex space-x-4">
        <SquareIconButton
            v-slot="{ className }"
            :label="$t('recipes.new.fromScratch')"
            route="recipes.create"
            @click="$emit('optionSelected')"
        >
            <i-zondicons-document :class="className" />
        </SquareIconButton>
        <SquareIconButton
            v-slot="{ className }"
            :label="$t('recipes.new.fromLibrary')"
            @click="$ui.openModal(RecipesLibraryModal), $emit('optionSelected')"
        >
            <i-zondicons-book-reference :class="className" />
        </SquareIconButton>
    </div>
</template>

<script setup lang="ts">
import RecipesLibraryModal from '@/components/modals/RecipesLibraryModal.vue';

defineEmits(['optionSelected']);
</script>
