<template>
    <form class="flex self-stretch flex-grow bg-gray-200 border-t" @submit.prevent="createNewRecipe">
        <input
            ref="input"
            v-model="name"
            type="text"
            class="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-transparent appearance-none rounded-bl-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Add something tasty"
        >
        <button
            type="submit"
            class="z-10 inline-flex px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-br-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
            Add
        </button>
    </form>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

import Recipe from '@/models/Recipe';

export default defineComponent({
    emits: ['created'],
    setup(_, { emit }) {
        const name = ref('');
        const input = ref<HTMLInputElement>();
        const focus = () => input.value?.focus();
        const createNewRecipe = async () => {
            if (!name.value)
                return;

            const attributes = { name: name.value };
            name.value = '';

            emit('created', await Recipe.create(attributes));
        };

        return { name, input, focus, createNewRecipe };
    },
});
</script>
