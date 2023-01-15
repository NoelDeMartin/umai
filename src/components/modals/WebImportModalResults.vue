<template>
    <CoreForm
        :form="form"
        class="flex flex-col"
        @submit="submit()"
    >
        <template v-if="recipes.length > 1">
            <CoreMarkdown :text="$t('webImport.success_infoMultiple')" />
            <RadioGroup v-model="selectedRecipe">
                <RadioGroupLabel class="sr-only">
                    {{ $t('webImport.success_recipes') }}
                </RadioGroupLabel>
                <WebImportModalResultsRecipeRadio
                    v-for="(recipe, index) of recipes"
                    :key="index"
                    :recipe="recipe"
                    class="mt-3"
                />
            </RadioGroup>
        </template>
        <template v-else-if="recipes.length === 1">
            <CoreMarkdown :text="$t('webImport.success_infoSingle')" />
            <WebImportModalResultsRecipe class="mt-4" :recipe="recipes[0]" />
        </template>
        <template v-else>
            <CoreMarkdown :text="$t('webImport.success_infoFallback')" />
            <WebImportModalResultsRecipe class="mt-4" :recipe="metadataRecipe" />
        </template>
        <CoreButton
            type="submit"
            class="self-end mt-4 py-3 px-6 text-md font-medium"
            :disabled="recipes.length > 1 && !selectedRecipe"
        >
            {{ $t('webImport.success_import') }}
        </CoreButton>
    </CoreForm>
</template>

<script setup lang="ts">
import Router from '@/framework/core/facades/Router';
import { arrayUnique } from '@noeldemartin/utils';
import { injectOrFail, requiredArrayProp, requiredObjectProp } from '@/framework/utils/vue';
import { reactiveForm } from '@/framework/forms';

import Cookbook from '@/services/facades/Cookbook';
import Recipe from '@/models/Recipe';
import type { WebsiteMetadata } from '@/utils/web-parsing';

import type IWebImportModal from './WebImportModal';

const { recipes, metadata } = defineProps({
    recipes: requiredArrayProp<Recipe>(),
    metadata: requiredObjectProp<WebsiteMetadata>(),
});
const modal = injectOrFail<IWebImportModal>(
    'web-import-modal',
    '<WebImportModalResults> must be a child of a <WebImportModal>',
);
const form = reactiveForm();
const selectedRecipe = $ref<Recipe | null>(null);
const metadataRecipe = $computed(() => new Recipe({
    name: metadata.title,
    description: metadata.description,
    imageUrls: metadata.imageUrls && arrayUnique(metadata.imageUrls),
    externalUrls: [metadata.url],
}));

async function submit(): Promise<void> {
    modal.close();

    await Router.push({
        name: 'recipes.create',
        state: {
            tmpRecipe: Cookbook.saveTmpRecipe(selectedRecipe as Recipe ?? recipes[0] ?? metadataRecipe),
        },
    });
}
</script>
