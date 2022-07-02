<template>
    <CoreForm
        :form="form"
        class="flex flex-col"
        @submit="submit()"
    >
        <template v-if="recipes.length > 1">
            <CoreMarkdown v-if="recipes.length > 1" :text="$t('webImport.success_infoMultiple')" />
            <ul v-if="recipes.length > 1" class="mt-4 space-y-2">
                <li class="flex items-center">
                    <BaseCheckbox
                        id="all-recipes"
                        class="w-6 h-6"
                        :checked="form.recipes.length === recipes.length"
                        @change="selectAllRecipes($event)"
                    />
                    <label class="ml-4 cursor-pointer" for="all-recipes">{{ $t('webImport.success_allRecipes') }}</label>
                </li>
                <li v-for="(recipe, index) of recipes" :key="index" class="flex items-center">
                    <BaseCheckbox
                        :id="`recipes-${index}`"
                        name="recipes"
                        :value="index"
                        class="w-6 h-6"
                    />
                    <label :for="`recipes-${index}`" class="mt-2 ml-4 w-full hover:cursor-pointer">
                        <RecipeListItem
                            :name="recipe.name"
                            :description="recipe.description"
                            :image-url="recipe.imageUrl"
                        />
                    </label>
                </li>
            </ul>
        </template>
        <template v-else-if="recipes.length === 1">
            <CoreMarkdown :text="$t('webImport.success_infoSingle')" />
            <RecipeListItem
                class="mt-4"
                :name="recipes[0]?.name"
                :description="recipes[0]?.description"
                :image-url="recipes[0]?.imageUrl"
            />
        </template>
        <template v-else>
            <CoreMarkdown :text="$t('webImport.success_infoFallback')" />
            <RecipeListItem
                class="mt-4"
                :name="metadata.title"
                :description="metadata.description"
                :image-url="metadata.imageUrl"
            />
        </template>
        <CoreButton
            class="self-end mt-4 py-3 px-6 text-lg font-medium"
            type="submit"
            :disabled="recipes.length > 0 && form.recipes.length === 0"
        >
            {{
                recipes.length > 1
                    ? $t('webImport.success_importMultiple')
                    : $t('webImport.success_importSingle')
            }}
        </CoreButton>
    </CoreForm>
</template>

<script setup lang="ts">
import Cloud from '@/framework/core/facades/Cloud';
import Network from '@/framework/core/facades/Network';
import Router from '@/framework/core/facades/Router';
import UI from '@/framework/core/facades/UI';
import { injectOrFail, requiredArrayProp, requiredObjectProp } from '@/framework/utils/vue';
import { FormInputType, reactiveForm } from '@/framework/forms';
import { translate } from '@/framework/utils/translate';

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
const form = $computed(
    () => reactiveForm({
        recipes: {
            type: FormInputType.Number,
            multi: true,
            default: recipes.map((_, index) => index),
        },
    }),
);

function selectAllRecipes({ target }: Event) {
    const checked = (target as HTMLInputElement)?.matches(':checked');

    form.recipes = checked ? recipes.map((_, index) => index) : [];
}

async function submit(): Promise<void> {
    modal.close();

    const selectedRecipes =
        recipes.length === 0
            ? [
                new Recipe({
                    name: metadata.title,
                    description: metadata.description,
                    imageUrl: metadata.imageUrl,
                    externalUrls: [metadata.url],
                }),
            ]
            : form.recipes.map(index => recipes?.[index]) as Recipe[];

    await Promise.all(selectedRecipes.map(recipe => recipe.save()));

    selectedRecipes.length === 1 && await Router.push({
        name: 'recipes.show',
        params: { recipe: selectedRecipes[0]?.uuid },
    });

    UI.showSnackbar(translate('webImport.done', selectedRecipes.length));

    Network.online && Cloud.sync();
}
</script>
