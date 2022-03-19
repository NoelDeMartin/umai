<template>
    <div class="flex space-x-4">
        <HeadlessButton
            class="flex flex-col justify-center items-center p-4 w-40 h-40 bg-gray-200 hover:bg-gray-300 active:bg-gray-300"
            route="recipes.create"
            @click="$emit('optionSelected')"
        >
            <i-zondicons-document class="w-12 h-12 text-gray-500" />
            <span class="mt-2 text-lg font-medium text-center text-gray-700">{{ $t('recipes.new.fromScratch') }}</span>
        </HeadlessButton>
        <HeadlessButton
            class="flex flex-col justify-center items-center p-4 w-40 h-40 bg-gray-200 hover:bg-gray-300 active:bg-gray-300"
            @click="$ui.openModal(WebImportModal), $emit('optionSelected')"
        >
            <i-zondicons-globe class="w-12 h-12 text-gray-500" />
            <span class="mt-2 text-lg font-medium text-center text-gray-700">{{ $t('recipes.new.fromTheWeb') }}</span>
        </HeadlessButton>
        <BaseFileInput
            accept="application/json"
            parse="json"
            class="flex flex-col justify-center items-center p-4 w-40 h-40 bg-gray-200 hover:bg-gray-300 active:bg-gray-300 cursor-pointer"
            @error="(error: unknown) => $errors.report(error)"
            @success="(jsonld: JsonLD) => (importFromJsonLD(jsonld), $emit('optionSelected'))"
        >
            <i-zondicons-upload class="w-12 h-12 text-gray-500" />
            <span class="mt-2 text-lg font-medium text-center text-gray-700">{{ $t('recipes.new.fromJsonLD') }}</span>
        </BaseFileInput>
    </div>
</template>

<script setup lang="ts">
import type { JsonLD } from '@noeldemartin/solid-utils';

import Router from '@/framework/core/facades/Router';

import Recipe from '@/models/Recipe';
import WebImportModal from '@/components/modals/WebImportModal.vue';

defineEmits(['optionSelected']);

async function importFromJsonLD(jsonld: JsonLD) {
    const recipe = await Recipe.createFromJsonLD(jsonld);

    Router.push({
        name: 'recipes.show',
        params: { recipe: recipe.uuid },
    });
}
</script>
