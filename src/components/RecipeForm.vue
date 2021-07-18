<template>
    <form
        class="flex flex-col flex-grow max-w-2xl p-6 space-y-4 bg-white rounded shadow"
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
                    class="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-transparent border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
                    class="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-transparent border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Step 1: Prepare ingredients&#10;Step 2: ???&#10;Step 3: Profit!"
                    rows="3"
                />
            </div>
        </div>
        <div>
            <h2 class="block mb-2 text-sm font-medium text-gray-700">
                Ingredients
            </h2>
            <ul v-if="ingredients.length > 0" class="border border-b-0 border-gray-200 divide-y divide-gray-200 rounded-t-md">
                <li v-for="(ingredient, index) in ingredients" :key="index" class="flex items-center justify-between px-3 py-2">
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
                    class="block w-full py-2 pl-3 pr-12 border border-gray-300 rounded-b-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    :class="{ 'rounded-t-md': ingredients.length === 0 }"
                    placeholder="Ingredient"
                    @keydown.enter.prevent="addIngredient()"
                >
                <div class="absolute inset-y-0 right-0 flex items-center">
                    <button
                        aria-label="Add ingredient"
                        type="button"
                        class="inline-flex px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-br-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        :class="{ 'rounded-tr-md': ingredients.length === 0 }"
                        @click="addIngredient()"
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
        <div class="flex flex-row-reverse self-end space-x-2 space-x-reverse">
            <button
                type="submit"
                class="inline-flex px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                {{ recipe ? 'Save' : 'Create' }}
            </button>
            <button
                type="button"
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                @click="$emit('cancel')"
            >
                Cancel
            </button>
        </div>
    </form>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import type { PropType } from 'vue';

import Recipe from '@/models/Recipe';

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
        const newIngredient = ref();
        const ingredients = ref<string[]>(props.recipe?.ingredients.slice(0) ?? []);
        const nameInput = ref<HTMLInputElement>();
        const focus = () => nameInput.value?.focus();
        const addIngredient = () => {
            ingredients.value.push(newIngredient.value);

            newIngredient.value = '';
        };
        const removeIngredient = (index: number) => ingredients.value.splice(index, 1);
        const submit = async () => {
            if (!name.value)
                return;

            const attributes = {
                name: name.value,
                description: description.value || null,
                ingredients: ingredients.value,
            };
            const recipe = props.recipe
                ? await props.recipe.update(attributes)
                : await Recipe.create(attributes);

            emit('done', recipe);
        };

        return {
            name,
            description,
            newIngredient,
            ingredients,
            nameInput,
            focus,
            addIngredient,
            removeIngredient,
            submit,
        };
    },
});
</script>
