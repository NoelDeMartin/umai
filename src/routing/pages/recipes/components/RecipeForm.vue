<template>
    <!-- TODO fix scrollable area to cover only form, not buttons -->
    <form ref="form" class="mb-10" @submit.prevent="submit">
        <h1 id="recipe-form-title" class="sr-only">
            {{ a11yTitle }}
        </h1>
        <RecipePageLayout>
            <template #image>
                <RecipeImage class="absolute inset-0" />
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
                    :placeholder="$t('recipes.description_placeholder')"
                />
            </template>

            <template #ingredients>
                <div class="not-prose">
                    <RecipeIngredientsInput v-model="ingredients" />
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
                            class="text-right"
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
                            class="text-right"
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
                            class="text-right"
                        />
                    </li>
                </ul>
            </template>
        </RecipePageLayout>

        <!-- TODO refactor UX & translate -->
        <div class="fixed inset-x-0 bottom-0 z-10 bg-gray-300">
            <div class="flex justify-end py-4 mx-auto space-x-4 max-w-content">
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
import { arraySorted, objectWithoutEmpty, uuid } from '@noeldemartin/utils';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Attributes } from 'soukai';
import type { PropType } from 'vue';

import Recipe from '@/models/Recipe';

import type { RecipeIngredientInputData } from './RecipeIngredientInput';
import type { RecipeInstructionStepInputData } from './RecipeInstructionStepInput';

const props = defineProps({
    recipe: {
        type: Object as PropType<Recipe>,
        default: null,
    },
});
const emit = defineEmits(['done', 'cancel']);

const { t } = useI18n();
const form = ref(null as unknown as HTMLElement);
const name = ref(props.recipe?.name ?? '');
const description = ref(props.recipe?.description ?? '');
const servings = ref(props.recipe?.servings ?? '');
const prepTime = ref(props.recipe?.prepTime ?? '');
const cookTime = ref(props.recipe?.cookTime ?? '');
const ingredients = ref<RecipeIngredientInputData[]>((props.recipe?.ingredients ?? []).map(name => ({
    name, id: uuid(),
})));
const instructions = ref<RecipeInstructionStepInputData[]>(
    // TODO sort in model
    arraySorted(props.recipe?.instructions ?? [], 'position').map(instruction => ({
        id: uuid(),
        url: instruction.url,
        description: instruction.text,
    })),
);
const a11yTitle = computed(
    () => props.recipe
        ? t('recipes.edit_a11y_title', { recipe: props.recipe.name })
        : t('recipes.create_a11y_title'),
);

async function submit() {
    const attributes = {
        name: name.value,
        // TODO imageUrl: imageUrl.value || null,
        description: description.value || null,
        servings: servings.value || null,
        prepTime: prepTime.value || null,
        cookTime: cookTime.value || null,
        ingredients: ingredients.value.filter(({ name }) => !!name).map(({ name }) => name),
    };

    const recipe = props.recipe ?? new Recipe(attributes);
    const instructionUrls = instructions.value.map(({ url }) => url);
    const instructionStepsAttributes = instructions.value
        .filter(({ description }) => !!description)
        .map(instruction => objectWithoutEmpty({
            url: instruction.url,
            text: instruction.description,
        } as Attributes));

    recipe.setAttributes(attributes);

    let position = 1;
    for (const instructionStepAttributes of instructionStepsAttributes) {
        const instructionStep = instructionStepAttributes.url
            && recipe.instructions?.find(model => model.url === instructionStepAttributes.url);

        instructionStepAttributes.position = position++;

        instructionStep
            ? instructionStep.setAttributes(instructionStepAttributes)
            : recipe.relatedInstructions.attach(instructionStepAttributes);
    }

    for (const instruction of recipe.instructions ?? []) {
        if (instructionUrls.includes(instruction.url))
            continue;

        recipe.relatedInstructions.detach(instruction);
    }

    await recipe.save();

    emit('done', recipe);
}
</script>
