<template>
    <div class="flex flex-col space-y-4 w-full md:space-x-4 md:space-y-0 md:flex-row md:w-auto">
        <HeadlessButton
            v-initial-focus="!$ui.isMobile"
            v-wobbly-border="wobblyBorder"
            class="
                flex flex-row items-center justify-center bg-gray-300 text-gray-700 px-2 py-3 w-full
                hover:bg-primary-500 hover:text-white
                focus:bg-primary-500 focus:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                active:bg-primary-700 active:text-white
                md:flex-col md:h-40 md:w-40 md:px-0 md:py-0
            "
            @click="$ui.openModal(WebImportModal), $emit('optionSelected')"
        >
            <i-pepicons-internet class="w-8 h-8 md:w-12 md:h-12" aria-hidden="true" />
            <span class="ml-2 text-center text-lg font-medium md:ml-0 md:mt-2">{{ $t('recipes.new.fromTheWeb') }}</span>
        </HeadlessButton>
        <HeadlessButton
            v-wobbly-border="wobblyBorder"
            class="
                flex flex-row items-center justify-center bg-gray-300 text-gray-700 px-2 py-3 w-full
                hover:bg-primary-500 hover:text-white
                focus:bg-primary-500 focus:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                active:bg-primary-700 active:text-white
                md:flex-col md:h-40 md:w-40 md:px-0 md:py-0
            "
            route="recipes.create"
            @click="$emit('optionSelected')"
        >
            <i-pepicons-pen class="w-8 h-8 md:w-12 md:h-12" aria-hidden="true" />
            <span class="ml-2 text-center text-lg font-medium md:ml-0 md:mt-2">{{ $t('recipes.new.fromScratch') }}</span>
        </HeadlessButton>
        <BaseFileInput
            v-wobbly-border="wobblyBorder"
            accept="application/json, application/ld+json"
            parse="json"
            class="
                flex flex-row items-center justify-center bg-gray-300 text-gray-700 px-2 py-3 w-full
                focus-within:bg-primary-500 focus-within:text-white focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2
                hover:cursor-pointer hover:bg-primary-500 hover:text-white
                active:bg-primary-700 active:text-white
                md:flex-col md:h-40 md:w-40 md:px-0 md:py-0
            "
            @error="(error: unknown) => $errors.report(error)"
            @success="(jsonld: JsonLD) => (importFromJsonLD(jsonld), $emit('optionSelected'))"
        >
            <i-file-icons-json-ld2 class="w-8 h-8 md:w-12 md:h-12" aria-hidden="true" />
            <span class="ml-2 text-center text-lg font-medium md:ml-0 md:mt-2">{{ $t('recipes.new.fromJsonLD') }}</span>
        </BaseFileInput>
    </div>
</template>

<script setup lang="ts">
import type { JsonLD } from '@noeldemartin/solid-utils';

import Cloud from '@/framework/core/facades/Cloud';
import Router from '@/framework/core/facades/Router';
import UI from '@/framework/core/facades/UI';

import Recipe from '@/models/Recipe';
import WebImportModal from '@/components/modals/WebImportModal.vue';

defineEmits(['optionSelected']);

const wobblyBorder = $computed(() => UI.isMobile ? {} : { min: 200, max: 350 });

async function importFromJsonLD(jsonld: JsonLD) {
    const recipe = await Recipe.createFromJsonLD(jsonld);

    await Router.push({
        name: 'recipes.show',
        params: { recipe: recipe.slug },
    });

    await Cloud.syncIfOnline(recipe);
}
</script>
