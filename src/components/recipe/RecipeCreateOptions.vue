<template>
    <div class="flex space-x-4">
        <HeadlessButton
            v-initial-focus
            v-wobbly-border="{ min: 200, max: 350 }"
            class="flex h-40 w-40 flex-col items-center justify-center bg-gray-300 text-gray-700 hover:bg-primary-500 hover:text-white focus:bg-primary-500 focus:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:bg-primary-700"
            @click="$ui.openModal(WebImportModal), $emit('optionSelected')"
        >
            <i-pepicons-internet class="h-12 w-12" aria-hidden="true" />
            <span class="mt-2 text-center text-lg font-medium">{{ $t('recipes.new.fromTheWeb') }}</span>
        </HeadlessButton>
        <HeadlessButton
            v-wobbly-border="{ min: 200, max: 350 }"
            class="flex h-40 w-40 flex-col items-center justify-center bg-gray-300 text-gray-700 hover:bg-primary-500 hover:text-white focus:bg-primary-500 focus:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:bg-primary-700"
            route="recipes.create"
            @click="$emit('optionSelected')"
        >
            <i-pepicons-pen class="h-12 w-12" aria-hidden="true" />
            <span class="mt-2 text-center text-lg font-medium">{{ $t('recipes.new.fromScratch') }}</span>
        </HeadlessButton>
        <BaseFileInput
            v-wobbly-border="{ min: 200, max: 350 }"
            accept="application/json, application/ld+json"
            parse="json"
            class="flex h-40 w-40 flex-col items-center justify-center bg-gray-300 text-gray-700 focus-within:bg-primary-500 focus-within:text-white focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 hover:cursor-pointer hover:bg-primary-500 hover:text-white active:bg-primary-700 active:text-white"
            @error="(error: unknown) => $errors.report(error)"
            @success="(jsonld: JsonLD) => (importFromJsonLD(jsonld), $emit('optionSelected'))"
        >
            <i-file-icons-json-ld2 class="h-12 w-12" aria-hidden="true" />
            <span class="mt-2 text-center text-lg font-medium">{{ $t('recipes.new.fromJsonLD') }}</span>
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
