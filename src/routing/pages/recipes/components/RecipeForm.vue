<template>
    <!-- TODO fix scrollable area to cover only form, not buttons -->
    <form ref="form" class="mb-10" @submit.prevent="submit">
        <h1 id="recipe-form-title" class="sr-only">
            {{ a11yTitle }}
        </h1>
        <RecipePage>
            <template #image>
                <div class="absolute inset-0 group">
                    <RecipeImage :url="imageUrl" class="w-full h-full" />
                    <button
                        type="button"
                        class="flex absolute inset-0 justify-center items-center w-full text-xl text-white bg-black bg-opacity-10 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        @click="editImage"
                    >
                        <div class="flex items-center self-center px-4 py-2 bg-black bg-opacity-50 rounded-md hover:bg-opacity-100">
                            <i-zondicons-edit-pencil aria-hidden="true" class="mr-3 w-4 h-4" />
                            {{ $t('recipes.image_edit') }}
                        </div>
                    </button>
                </div>
            </template>

            <template #title>
                <BaseFluidInput
                    v-model="name"
                    name="name"
                    :placeholder="$t('recipes.name_placeholder')"
                    :class="[
                        'text-4xl text-white bg-transparent caret-primary-500',
                        name && 'text-shadow font-semibold',
                    ]"
                />
            </template>

            <template #description>
                <BaseFluidTextArea
                    v-model="description"
                    name="description"
                    :label="$t('recipes.description_label')"
                    :placeholder="$t('recipes.description_placeholder')"
                />
            </template>

            <template #ingredients>
                <div class="not-prose">
                    <BaseInputList
                        v-model="ingredients"
                        item-name-prefix="ingredient"
                        :add-label="$t('recipes.ingredient_add')"
                        :item-placeholder="$t('recipes.ingredient_placeholder')"
                        :item-remove-label="$t('recipes.ingredient_remove')"
                        :item-remove-a11y-label="$t('recipes.ingredient_remove_a11y', { ingredient: ':item' })"
                    />
                </div>
            </template>

            <template #instructions>
                <RecipeInstructionsInput v-model="instructions" />
            </template>

            <template #metadata>
                <ul class="hidden mb-2 space-y-2 text-gray-700 md:block">
                    <li class="flex items-center space-x-1">
                        <i-zondicons-location-food class="w-3 h-3" />
                        <strong>{{ $t('recipes.servings') }}</strong>
                        <div class="flex-grow" />
                        <BaseFluidInput
                            v-model="servings"
                            :placeholder="$t('recipes.servings_placeholder')"
                            name="servings"
                            class="text-right bg-transparent"
                        />
                    </li>
                    <li class="flex items-center space-x-1">
                        <i-zondicons-hour-glass class="w-3 h-3" />
                        <strong>{{ $t('recipes.prepTime') }}</strong>
                        <div class="flex-grow" />
                        <BaseFluidInput
                            v-model="prepTime"
                            :placeholder="$t('recipes.prepTime_placeholder')"
                            name="prep-time"
                            class="text-right bg-transparent"
                        />
                    </li>
                    <li class="flex items-center space-x-1">
                        <i-zondicons-time class="w-3 h-3" />
                        <strong>{{ $t('recipes.cookTime') }}</strong>
                        <div class="flex-grow" />
                        <BaseFluidInput
                            v-model="cookTime"
                            :placeholder="$t('recipes.cookTime_placeholder')"
                            name="cook-time"
                            class="text-right bg-transparent"
                        />
                    </li>
                </ul>
            </template>

            <template #urls>
                <BaseInputList v-model="externalUrls" />
            </template>
        </RecipePage>

        <!-- TODO refactor UX & translate -->
        <div class="fixed inset-x-0 bottom-0 z-10 bg-gray-300">
            <div class="flex py-4 mx-auto space-x-4 max-w-content">
                <BaseButton v-if="recipe" clear @click="deleteRecipe()">
                    <i-zondicons-trash class="mr-2 w-4 h-4" /> {{ $t('recipes.delete') }}
                </BaseButton>
                <dev class="flex-grow" />
                <BaseButton secondary @click="$emit('cancel')">
                    Cancel
                </BaseButton>
                <BaseButton type="submit">
                    {{ recipe ? 'Save' : 'Create' }}
                </BaseButton>
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
import { arrayFilter, arraySorted, objectWithoutEmpty, uuid } from '@noeldemartin/utils';
import { useI18n } from 'vue-i18n';
import type { Attributes } from 'soukai';
import type { PropType } from 'vue';

import Cloud from '@/framework/core/facades/Cloud';
import Files from '@/framework/core/facades/Files';
import UI from '@/framework/core/facades/UI';

import Cookbook from '@/services/facades/Cookbook';
import Recipe from '@/models/Recipe';
import type { BaseInputListItemData } from '@/components/base/BaseInputListItem';

import RecipeImageModal from './modals/RecipeImageFormModal.vue';
import type { IRecipeImageFormModal } from './modals/RecipeImageFormModal';
import type { RecipeInstructionStepInputData } from './RecipeInstructionStepInput';

const { recipe } = defineProps({
    recipe: {
        type: Object as PropType<Recipe | null>,
        default: null,
    },
});
const emit = defineEmits(['done', 'cancel']);

let imageUrl = $ref(recipe?.imageUrl ?? null);
const { t } = useI18n();
const form = $ref(null as unknown as HTMLElement);
const name = $ref(recipe?.name ?? '');
const description = $ref(recipe?.description ?? '');
const servings = $ref(recipe?.servings ?? '');
const prepTime = $ref(recipe?.prepTime ?? '');
const cookTime = $ref(recipe?.cookTime ?? '');
const externalUrls = $ref<BaseInputListItemData[]>(
    // TODO sort in model
    (recipe?.sortedExternalUrls ?? []).map(url => ({
        id: uuid(),
        value: url,
    })),
);
const ingredients = $ref<BaseInputListItemData[]>(
    // TODO sort in model
    (recipe?.sortedIngredients ?? []).map(name => ({
        id: uuid(),
        value: name,
    })),
);
const instructions = $ref<RecipeInstructionStepInputData[]>(
    // TODO sort in model
    arraySorted(recipe?.instructions ?? [], 'position').map(instruction => ({
        id: uuid(),
        url: instruction.url,
        description: instruction.text,
    })),
);
const a11yTitle = $computed(
    () => recipe
        ? t('recipes.edit_a11y_title', { recipe: recipe.name })
        : t('recipes.create_a11y_title'),
);

async function editImage() {
    const modal = await UI.openModal<IRecipeImageFormModal>(RecipeImageModal, { imageUrl });
    const result = await modal.beforeClose;

    document.querySelector<HTMLElement>(':focus')?.blur();

    if (result !== undefined)
        imageUrl = result;
}

async function deleteRecipe() {
    if (!recipe)
        return;

    // TODO
}

async function submit() {
    const attributes = {
        name: name,
        imageUrl: imageUrl || null,
        description: description || null,
        servings: servings || null,
        prepTime: prepTime || null,
        cookTime: cookTime || null,
        ingredients: arrayFilter(ingredients.map(({ value }) => value)),
        externalUrls: arrayFilter(externalUrls.map(({ value }) => value)),
    };

    const updatedRecipe = recipe ?? new Recipe(attributes);
    const instructionUrls = instructions.map(({ url }) => url);
    const instructionStepsAttributes = instructions
        .filter(({ description }) => !!description)
        .map(instruction => objectWithoutEmpty({
            url: instruction.url,
            text: instruction.description,
        } as Attributes));

    updatedRecipe.setAttributes(attributes);

    let position = 1;
    for (const instructionStepAttributes of instructionStepsAttributes) {
        const instructionStep = instructionStepAttributes.url
            && updatedRecipe.instructions?.find(model => model.url === instructionStepAttributes.url);

        instructionStepAttributes.position = position++;

        instructionStep
            ? instructionStep.setAttributes(instructionStepAttributes)
            : updatedRecipe.relatedInstructions.attach(instructionStepAttributes);
    }

    for (const instruction of updatedRecipe.instructions ?? []) {
        if (instructionUrls.includes(instruction.url))
            continue;

        updatedRecipe.relatedInstructions.detach(instruction);
    }

    if (updatedRecipe.imageUrl?.startsWith('tmp://')) {
        updatedRecipe.exists() || updatedRecipe.mintUrl();

        const persistentImageUrl = `${updatedRecipe.getDocumentUrl()}.png`;

        await Files.rename(updatedRecipe.imageUrl, persistentImageUrl);

        if (Cookbook.remoteCookbookUrl && persistentImageUrl.startsWith(Cookbook.remoteCookbookUrl))
            Cloud.enqueueFileUpload(persistentImageUrl);

        updatedRecipe.imageUrl = persistentImageUrl;
    }

    await updatedRecipe.save();

    emit('done', updatedRecipe);
}
</script>
