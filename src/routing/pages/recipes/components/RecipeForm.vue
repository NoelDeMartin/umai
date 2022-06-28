<template>
    <CoreForm
        v-element-transitions="{
            name: 'recipe-form',
            id: recipe?.url ?? recipeUrl,
            transitions: {
                enter: {
                    'recipes.show': enterFromDetails,
                    '*': enterTransition,
                },
                leave: {
                    'recipes.show': leaveToDetails,
                    '*': leaveTransition,
                },
                'recipe-card': transitionToCard,
            },
        }"
        :data-was-onboarding="wasOnboarding"
        :form="form"
        class="flex-grow"
        @submit="submit()"
    >
        <h1 id="recipe-form-title" class="sr-only">
            {{ a11yTitle }}
        </h1>
        <RecipePage class="recipe-form--recipe-page">
            <template #image>
                <div class="absolute inset-0 group">
                    <RecipeImage :url="form.imageUrl" class="w-full h-full" />
                    <button
                        type="button"
                        class="group flex absolute inset-0 justify-center items-center w-full text-xl text-white opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:bg-opacity-20"
                        @click="editImage"
                    >
                        <div
                            v-wobbly-border
                            class="flex items-center self-center px-4 py-2 bg-black bg-opacity-50 rounded-md hover:bg-opacity-100 group-focus:ring-2 group-focus:ring-offset-[rgba(255,255,255,.5)] group-focus:ring-offset-2 group-focus:ring-[rgba(0,0,0,.5)] hover:group-focus:ring-black"
                        >
                            <i-pepicons-pen v-if="form.imageUrl" class="mr-3 w-4 h-4" aria-hidden="true" />
                            <i-pepicons-plus v-else class="mr-3 w-4 h-4" aria-hidden="true" />
                            {{ form.imageUrl ? $t('recipes.image_edit') : $t('recipes.image_set') }}
                        </div>
                    </button>
                </div>
            </template>

            <template #title>
                <label class="flex recipe-form--title-label">
                    <span class="sr-only">{{ $t('recipes.name_label') }}</span>

                    <!-- TODO ideally, we wouldn't need to add padding and negative margin, but div height
                    is not calculated properly in the textarea (because of line-height shenanigans) -->
                    <CoreFluidTextArea
                        ref="$name"
                        name="name"
                        :placeholder="recipe ? '-' : $t('recipes.name_placeholder')"
                        class="pb-2 -mb-2.5 text-4xl text-white placeholder:text-white placeholder:opacity-50 bg-transparent caret-primary-500 text-shadow font-semibold"
                    />
                </label>
            </template>

            <template #description>
                <div class="flex flex-col items-start space-y-3">
                    <div v-if="form.description || writingDescription" class="group relative w-full">
                        <CoreFluidTextArea
                            ref="$description"
                            name="description"
                            :label="$t('recipes.description_label')"
                            :placeholder="$t('recipes.description_placeholder')"
                            @focus="writingDescription = true"
                            @blur="writingDescription = false"
                        />
                        <CoreFluidActionButton
                            v-if="form.description"
                            :aria-label="$t('recipes.description_remove')"
                            :title="$t('recipes.description_remove')"
                            class="absolute right-1 bottom-1"
                            @click="removeDescription($event)"
                        >
                            <i-pepicons-trash aria-hidden="true" class="w-5 h-5" />
                        </CoreFluidActionButton>
                    </div>
                    <CoreButton
                        v-if="!form.description && !writingDescription"
                        secondary
                        tinted
                        class="px-4 space-x-2"
                        @click="focusDescription()"
                    >
                        <i-pepicons-pen class="w-4 h-4" aria-hidden="true" />
                        <span>{{ $t('recipes.description_set') }}</span>
                    </CoreButton>
                    <CoreButton
                        v-if="form.ingredients.length === 0"
                        secondary
                        tinted
                        class="px-4 space-x-2"
                        @click="initializeIngredients()"
                    >
                        <i-pepicons-cart class="w-4 h-4" aria-hidden="true" />
                        <span>{{ $t('recipes.ingredients_set') }}</span>
                    </CoreButton>
                    <CoreButton
                        v-if="form.instructions.length === 0"
                        secondary
                        tinted
                        class="px-4 space-x-2"
                        @click="initializeInstructions()"
                    >
                        <i-pepicons-file class="w-4 h-4" aria-hidden="true" />
                        <span>{{ $t('recipes.instructions_set') }}</span>
                    </CoreButton>
                </div>
            </template>

            <template v-if="form.ingredients.length > 0" #ingredients>
                <div class="not-prose mt-4">
                    <CoreFluidInputList
                        ref="$ingredients"
                        name="ingredients"
                        :add-label="$t('recipes.ingredient_add')"
                        :item-label="$t('recipes.ingredient_label')"
                        :item-placeholder="$t('recipes.ingredient_placeholder')"
                        :item-remove-label="$t('recipes.ingredient_remove')"
                        :item-remove-a11y-label="$t('recipes.ingredient_remove_a11y', { ingredient: ':value' })"
                    />
                </div>
            </template>

            <template v-if="form.instructions.length > 0" #instructions>
                <CoreFluidTextAreaList
                    ref="$instructions"
                    name="instructions"
                    :instructions-a11y="$t('recipes.drag_instructions_a11y')"
                    :add-label="$t('recipes.instructionStep_add')"
                    :item-label="$t('recipes.instructionStep_label')"
                    :item-placeholder="$t('recipes.instructionStep_placeholder')"
                    :item-remove-label="$t('recipes.instructionStep_remove')"
                    :item-remove-a11y-label="$t('recipes.instructionStep_remove_a11y', { position: ':position' })"
                />
            </template>

            <template #metadata>
                <RecipePageMetadata class="w-full">
                    <template #servings>
                        <CoreFluidInput
                            name="servings"
                            class="text-right bg-transparent"
                            :placeholder="$t('recipes.servings_placeholder')"
                        />
                    </template>
                    <template #prepTime>
                        <CoreFluidInput
                            name="prepTime"
                            class="text-right bg-transparent"
                            :placeholder="$t('recipes.prepTime_placeholder')"
                        />
                    </template>
                    <template #cookTime>
                        <CoreFluidInput
                            name="cookTime"
                            class="text-right bg-transparent"
                            :placeholder="$t('recipes.cookTime_placeholder')"
                        />
                    </template>
                </RecipePageMetadata>
            </template>

            <template #urls>
                <CoreButton
                    v-if="form.externalUrls.length === 0"
                    secondary
                    tinted
                    @click="initializeExternalUrls()"
                >
                    <i-pepicons-chain class="w-4 h-4" aria-hidden="true" />
                    <span class="ml-1">{{ $t('recipes.externalUrls_set') }}</span>
                </CoreButton>
                <CoreFluidInputList
                    v-else
                    ref="$externalUrls"
                    name="externalUrls"
                    inputs-class="w-full"
                    :add-label="$t('recipes.externalUrl_add')"
                    :item-label="$t('recipes.externalUrl_label')"
                    :item-placeholder="$t('recipes.externalUrl_placeholder')"
                    :item-remove-label="$t('recipes.externalUrl_remove')"
                    :item-remove-a11y-label="$t('recipes.externalUrl_remove_a11y', { url: ':value' })"
                >
                    <template #marker>
                        <i-pepicons-chain class="w-4 h-4" aria-hidden="true" />
                    </template>
                </CoreFluidInputList>
            </template>
        </RecipePage>

        <div class="fixed flex justify-center inset-x-0 bottom-0 z-30 bg-primary-gray-300 recipe-form--footer">
            <div class="mx-edge">
                <div class="flex">
                    <div class="prose mr-8">
                        <CoreProseFiller />
                    </div>
                    <div class="w-72" />
                </div>
                <div class="flex flex-row-reverse items-center py-4 space-x-reverse space-x-4">
                    <div class="flex flex-row-reverse space-x-4 space-x-reverse">
                        <CoreButton
                            type="submit"
                            class="text-lg focus:ring-offset-primary-gray-300"
                        >
                            {{ recipe ? $t('recipes.form.update') : $t('recipes.form.create') }}
                        </CoreButton>
                        <CoreButton
                            clear
                            class="text-lg focus:ring-offset-primary-gray-300"
                            @click="$emit('cancel')"
                        >
                            {{ $t('recipes.form.cancel') }}
                        </CoreButton>
                    </div>
                    <div class="flex-grow" />
                    <CoreButton
                        v-if="recipe"
                        clear
                        class="focus:ring-offset-primary-gray-300"
                        @click="deleteRecipe()"
                    >
                        <i-pepicons-trash class="w-4 h-4" aria-hidden="true" />
                        <span class="ml-1">{{ $t('recipes.delete') }}</span>
                    </CoreButton>
                </div>
            </div>
        </div>
    </CoreForm>
</template>

<script setup lang="ts">
import { arrayFilter, objectWithoutEmpty, tap } from '@noeldemartin/utils';
import { nextTick, onMounted } from 'vue';
import type { Attributes } from 'soukai';

import App from '@/framework/core/facades/App';
import Cloud from '@/framework/core/facades/Cloud';
import Files from '@/framework/core/facades/Files';
import Router from '@/framework/core/facades/Router';
import UI from '@/framework/core/facades/UI';
import { FormInputType, reactiveForm } from '@/framework/forms';
import { objectProp } from '@/framework/utils/vue';
import { translate } from '@/framework/utils/translate';
import type { FormObjectInput } from '@/framework/forms';
import type { IFocusable } from '@/framework/components/headless';

import Cookbook from '@/services/facades/Cookbook';
import Recipe from '@/models/Recipe';
import CoreListItemValue from '@/components/core/lists/CoreListItemValue';

import RecipeImageModal from './modals/RecipeImageFormModal.vue';
import {
    enterFromDetails,
    enterTransition,
    leaveToDetails,
    leaveTransition,
    transitionToCard,
} from './RecipeForm.transitions';
import type { IRecipeImageFormModal } from './modals/RecipeImageFormModal';

const { recipe } = defineProps({
    recipe: objectProp<Recipe>(),
});
const emit = defineEmits(['done', 'cancel']);

let writingDescription = $ref<boolean>(false);
let wasOnboarding = $ref<boolean>(App.isOnboarding);
const instructionUrls: Record<string, string> = {};

const form = reactiveForm({
    name: {
        type: FormInputType.String,
        rules: 'required',
        default: recipe?.name ?? '',
    },
    description: {
        type: FormInputType.String,
        default: recipe?.description ?? '',
    },
    imageUrl: {
        type: FormInputType.String,
        default: recipe?.imageUrl ?? '',
    },
    servings: {
        type: FormInputType.String,
        default: recipe?.servings ?? '',
    },
    prepTime: {
        type: FormInputType.String,
        default: recipe?.prepTime ?? '',
    },
    cookTime: {
        type: FormInputType.String,
        default: recipe?.cookTime ?? '',
    },
    ingredients: {
        type: FormInputType.Object as FormObjectInput<CoreListItemValue>,
        multi: true,
        default: (recipe?.sortedIngredients ?? []).map(name => new CoreListItemValue(name)),
    },
    instructions: {
        type: FormInputType.Object as FormObjectInput<CoreListItemValue>,
        multi: true,
        default: (recipe?.sortedInstructions ?? []).map(
            step => tap(
                new CoreListItemValue(step.text),
                value =>(instructionUrls[value.id] = step.url),
            ),
        ),
    },
    externalUrls: {
        type: FormInputType.Object as FormObjectInput<CoreListItemValue>,
        multi: true,
        default: (recipe?.sortedExternalUrls ?? []).map(url => new CoreListItemValue(url)),
    },
});

let recipeUrl = $ref<string | null>(null);
const $name = $ref<IFocusable | null>(null);
const $description = $ref<IFocusable | null>(null);
const $ingredients = $ref<IFocusable | null>(null);
const $instructions = $ref<IFocusable | null>(null);
const $externalUrls = $ref<IFocusable | null>(null);
const a11yTitle = $computed(
    () => recipe
        ? translate('recipes.edit_a11y_title', { recipe: recipe.name })
        : translate('recipes.create_a11y_title'),
);

async function editImage() {
    const modal = await UI.openModal<IRecipeImageFormModal>(RecipeImageModal, { imageUrl: form.imageUrl });
    const result = await modal.beforeClose;

    document.querySelector<HTMLElement>(':focus')?.blur();

    result !== undefined && form.input<string>('imageUrl')?.update(result ?? '');
}

async function focusDescription() {
    writingDescription = true;

    await nextTick();

    $description?.focus();
}

function removeDescription({ target }: Event) {
    form.input('description')?.update('');

    (target as HTMLElement | null)?.blur();
}

async function initializeIngredients() {
    form.input('ingredients')?.update([new CoreListItemValue()]);

    await nextTick();

    $ingredients?.focus();
}

async function initializeInstructions() {
    form.input('instructions')?.update([new CoreListItemValue()]);

    await nextTick();

    $instructions?.focus();
}

async function initializeExternalUrls() {
    form.input('externalUrls')?.update([new CoreListItemValue()]);

    await nextTick();

    $externalUrls?.focus();
}

async function deleteRecipe() {
    if (!recipe)
        return;

    const confirmed = await UI.confirm({
        message: translate('recipes.delete_confirm'),
        acceptText: translate('recipes.delete_confirm_accept'),
    });

    if (!confirmed)
        return;

    Router.push({ name: 'home' });

    await UI.runOperation(() => Cookbook.deleteRecipe(recipe), {
        blocking: true,
        loadingMessage: translate('recipes.delete_ongoing', { name: recipe.name }),
        successMessage: translate('recipes.delete_success', { name: recipe.name }),
    });
}

async function submit() {
    const updatedAttributes = {
        name: form.name,
        imageUrl: form.imageUrl || null,
        description: form.description || null,
        servings: form.servings || null,
        prepTime: form.prepTime || null,
        cookTime: form.cookTime || null,
        ingredients: arrayFilter(form.ingredients.map(({ value }) => value)),
        externalUrls: arrayFilter(form.externalUrls.map(({ value }) => value)),
    };
    const updatedRecipe = recipe
        ? tap(recipe, recipe => recipe.setAttributes(updatedAttributes))
        : new Recipe(updatedAttributes);
    const updatedInstructionUrls = form.instructions.map(({ id }) => instructionUrls[id] ?? null);
    const updateInstructionAttributes = form.instructions
        .filter(({ value }) => !!value)
        .map(({ id, value }) => objectWithoutEmpty({
            url: instructionUrls[id],
            text: value,
        } as Attributes));

    let position = 1;
    for (const instructionStepAttributes of updateInstructionAttributes) {
        const instructionStep = instructionStepAttributes.url
            && updatedRecipe.instructions?.find(model => model.url === instructionStepAttributes.url);

        instructionStepAttributes.position = position++;

        instructionStep
            ? instructionStep.setAttributes(instructionStepAttributes)
            : updatedRecipe.relatedInstructions.attach(instructionStepAttributes);
    }

    for (const instruction of updatedRecipe.instructions ?? []) {
        if (!instruction.exists() || updatedInstructionUrls.includes(instruction.url))
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

    recipeUrl = updatedRecipe.url;

    emit('done', updatedRecipe);
}

onMounted(() => {
    $name?.focus();
    wasOnboarding = App.isOnboarding;
});
</script>

<style>
.recipe-form--recipe-page .recipe-page--body {
    /* Footer height + p-4 */
    padding-bottom: calc(66px + 1rem);
}
</style>
