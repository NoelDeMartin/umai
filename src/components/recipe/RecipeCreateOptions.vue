<template>
    <div class="flex space-x-4">
        <HeadlessButton
            class="flex h-40 w-40 flex-col items-center justify-center bg-gray-200 p-4 hover:bg-gray-300 active:bg-gray-300"
            route="recipes.create"
            @click="$emit('optionSelected')"
        >
            <i-zondicons-document class="h-12 w-12 text-gray-500" />
            <span class="mt-2 text-center text-lg font-medium text-gray-700">{{
                $t('recipes.new.fromScratch')
            }}</span>
        </HeadlessButton>
        <HeadlessButton
            class="flex h-40 w-40 flex-col items-center justify-center bg-gray-200 p-4 hover:bg-gray-300 active:bg-gray-300"
            @click="$ui.openModal(WebImportModal), $emit('optionSelected')"
        >
            <i-zondicons-globe class="h-12 w-12 text-gray-500" />
            <span class="mt-2 text-center text-lg font-medium text-gray-700">{{
                $t('recipes.new.fromTheWeb')
            }}</span>
        </HeadlessButton>
        <BaseFileInput
            accept="application/json"
            parse="json"
            class="flex h-40 w-40 cursor-pointer flex-col items-center justify-center bg-gray-200 p-4 hover:bg-gray-300 active:bg-gray-300"
            @error="(error: unknown) => $errors.report(error)"
            @success="(jsonld: JsonLD) => (importFromJsonLD(jsonld), $emit('optionSelected'))"
        >
            <i-zondicons-upload class="h-12 w-12 text-gray-500" />
            <span class="mt-2 text-center text-lg font-medium text-gray-700">{{
                $t('recipes.new.fromJsonLD')
            }}</span>
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
