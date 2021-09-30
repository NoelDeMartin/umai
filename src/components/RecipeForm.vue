<template>
    <form
        class="flex flex-col flex-grow p-6 space-y-4 max-w-2xl bg-white rounded shadow"
        @submit.prevent="submit"
    >
        <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
            <div class="mt-1">
                <input
                    id="name"
                    ref="nameInput"
                    v-model="name"
                    type="text"
                    class="block relative px-3 py-2 w-full placeholder-gray-500 text-gray-900 rounded-md border border-transparent border-gray-300 appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Something tasty..."
                >
            </div>
        </div>
        <div>
            <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
            <div class="mt-1">
                <textarea
                    id="description"
                    v-model="description"
                    class="block relative px-3 py-2 w-full placeholder-gray-500 text-gray-900 rounded-md border border-transparent border-gray-300 appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Step 1: Prepare ingredients&#10;Step 2: ???&#10;Step 3: Profit!"
                    rows="3"
                />
            </div>
        </div>
        <div>
            <h2 class="block mb-2 text-sm font-medium text-gray-700">
                Ingredients
            </h2>
            <ul v-if="ingredients.length > 0" class="rounded-t-md border border-b-0 border-gray-200 divide-y divide-gray-200">
                <li v-for="(ingredient, index) in ingredients" :key="index" class="flex justify-between items-center px-3 py-2">
                    {{ ingredient }}
                    <button
                        type="button"
                        title="Remove"
                        :aria-label="`Remove '${ingredient}' ingredient`"
                        @click="removeIngredient(index)"
                    >
                        <i-zondicons-trash class="w-4 h-4 text-gray-500 opacity-30 hover:opacity-100 hover:text-red-500" />
                    </button>
                </li>
            </ul>
            <label for="new-ingredient" class="sr-only">New Ingredient</label>
            <div class="relative shadow-sm">
                <input
                    id="new-ingredient"
                    v-model="newIngredient"
                    type="text"
                    class="block py-2 pr-12 pl-3 w-full rounded-b-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    :class="{ 'rounded-t-md': ingredients.length === 0 }"
                    placeholder="Ingredient"
                    @keydown.enter.prevent="addIngredient()"
                >
                <div class="flex absolute inset-y-0 right-0 items-center">
                    <button
                        aria-label="Add ingredient"
                        type="button"
                        class="inline-flex px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-br-md border border-transparent hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        :class="{ 'rounded-tr-md': ingredients.length === 0 }"
                        @click="addIngredient()"
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
        <div>
            <h2 class="block mb-2 text-sm font-medium text-gray-700">
                Instructions
            </h2>
            <ul v-if="instructions.length > 0" class="rounded-t-md border border-b-0 border-gray-200 divide-y divide-gray-200">
                <li v-for="(instructionStep, index) in instructions" :key="instructionStep.url" class="flex justify-between items-center px-3 py-2">
                    {{ instructionStep.position }}. {{ instructionStep.text }}
                    <div>
                        <button
                            type="button"
                            title="Move down"
                            aria-label="Move instruction step down"
                            @click="moveInstructionStep(index, 1)"
                        >
                            <i-zondicons-cheveron-down class="w-4 h-4 text-gray-500 opacity-30 hover:opacity-100 hover:text-red-500" />
                        </button>
                        <button
                            type="button"
                            title="Move up"
                            aria-label="Move instruction step up"
                            @click="moveInstructionStep(index, -1)"
                        >
                            <i-zondicons-cheveron-up class="w-4 h-4 text-gray-500 opacity-30 hover:opacity-100 hover:text-red-500" />
                        </button>
                        <button
                            type="button"
                            title="Change text"
                            aria-label="Change instruction step text"
                            @click="changeInstructionStepText(index)"
                        >
                            <i-zondicons-edit-pencil class="w-4 h-4 text-gray-500 opacity-30 hover:opacity-100 hover:text-red-500" />
                        </button>
                        <button
                            type="button"
                            title="Remove"
                            aria-label="Remove instruction step"
                            @click="removeInstructionStep(index)"
                        >
                            <i-zondicons-trash class="w-4 h-4 text-gray-500 opacity-30 hover:opacity-100 hover:text-red-500" />
                        </button>
                    </div>
                </li>
            </ul>
            <label for="new-instruction-step" class="sr-only">New Instruction step</label>
            <div class="relative shadow-sm">
                <input
                    id="new-instruction-step"
                    v-model="newInstructionStep"
                    type="text"
                    class="block py-2 pr-12 pl-3 w-full rounded-b-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    :class="{ 'rounded-t-md': instructions.length === 0 }"
                    placeholder="Instruction step"
                    @keydown.enter.prevent="addInstructionStep()"
                >
                <div class="flex absolute inset-y-0 right-0 items-center">
                    <button
                        aria-label="Add instruction step"
                        type="button"
                        class="inline-flex px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-br-md border border-transparent hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        :class="{ 'rounded-tr-md': instructions.length === 0 }"
                        @click="addInstructionStep()"
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
        <div class="flex flex-row-reverse self-end space-x-2 space-x-reverse">
            <button
                type="submit"
                class="inline-flex px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md border border-transparent hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                {{ recipe ? 'Save' : 'Create' }}
            </button>
            <button
                type="button"
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                @click="$emit('cancel')"
            >
                Cancel
            </button>
        </div>
    </form>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import type { Attributes } from 'soukai';
import type { PropType } from 'vue';

import Recipe from '@/models/Recipe';
import type RecipeInstructionsStep from '@/models/RecipeInstructionsStep';

export default defineComponent({
    props: {
        recipe: {
            type: Object as PropType<Recipe>,
            default: null,
        },
    },
    emits: ['done', 'cancel'],
    setup(props, { emit }) {
        const name = ref(props.recipe?.name ?? '');
        const description = ref(props.recipe?.description ?? '');
        const newIngredient = ref('');
        const newInstructionStep = ref('');
        const ingredients = ref<string[]>(props.recipe?.ingredients.slice(0) ?? []);
        const instructions = ref<Attributes[]>([]);
        const nameInput = ref<HTMLInputElement>();
        const focus = () => nameInput.value?.focus();
        const addIngredient = () => {
            ingredients.value.push(newIngredient.value);

            newIngredient.value = '';
        };
        const addInstructionStep = () => {
            const instructionStep = {
                text: newInstructionStep.value,
                position: Number(instructions.value.length + 1),
            };

            newInstructionStep.value = '';
            instructions.value.push(instructionStep);
        };
        const changeInstructionStepText = (index: number) => {
            const instructionStep = instructions.value[index];
            const text = prompt('What\'s the new text?', instructionStep.text);

            instructionStep.text = text;
            instructions.value = instructions.value.slice(0);
        };
        const removeIngredient = (index: number) => ingredients.value.splice(index, 1);
        const removeInstructionStep = (index: number) => instructions.value.splice(index, 1);
        const moveInstructionStep = (index: number, delta: number) => {
            const newIndex = (index + delta + instructions.value.length) % instructions.value.length;

            instructions.value[index].position = newIndex + 1;
            instructions.value[newIndex].position = index + 1;
            instructions.value.sort((a, b) => a.position - b.position);
        };
        const submit = async () => {
            if (!name.value)
                return;

            const attributes = {
                name: name.value,
                description: description.value || null,
                ingredients: ingredients.value,
            };

            const recipe = props.recipe ?? new Recipe(attributes);

            recipe.setAttributes(attributes);

            for (const instructionAttributes of instructions.value) {
                if (instructionAttributes.url) {
                    recipe.instructions
                        ?.find(model => model.url === instructionAttributes.url)
                        ?.setAttributes(instructionAttributes);
                } else {
                    recipe.relatedInstructions.attach(instructionAttributes);
                }

                // TODO delete removed instruction steps
            }

            await recipe.save();

            emit('done', recipe);
        };

        props.recipe?.loadRelation<RecipeInstructionsStep[]>('instructions').then(recipeInstructions => {
            instructions.value = recipeInstructions.map(step => step.getAttributes());
            instructions.value.sort((a, b) => a.position - b.position);
        });

        return {
            name,
            description,
            newIngredient,
            newInstructionStep,
            ingredients,
            instructions,
            nameInput,
            focus,
            addIngredient,
            addInstructionStep,
            changeInstructionStepText,
            removeIngredient,
            removeInstructionStep,
            moveInstructionStep,
            submit,
        };
    },
});
</script>
