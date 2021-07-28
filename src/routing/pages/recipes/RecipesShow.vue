<template>
    <div v-if="recipe" class="flex flex-col items-center justify-center flex-grow p-8 space-y-4">
        <div class="w-full max-w-2xl p-6 bg-white rounded shadow">
            <div class="flex justify-between">
                <h1 class="text-2xl text-gray-900">
                    {{ recipe.name }}
                </h1>
                <router-link
                    class="inline-flex opacity-30 hover:opacity-100"
                    title="Edit"
                    :to="{ name: 'recipes.edit', params: { recipe: recipe.uuid }}"
                >
                    edit
                </router-link>
            </div>
            <p class="mt-2 text-sm italic text-gray-500">
                {{ recipe.description || 'No description' }}
            </p>
            <ul v-if="recipe.ingredients.length > 0" class="mt-2 ml-2 list-disc">
                <li v-for="(ingredient, index) of recipe.ingredients" :key="index" class="text-xs">
                    {{ ingredient }}
                </li>
            </ul>
            <ol v-if="instructions.length > 0" class="mt-2">
                <li v-for="(instructionStep, index) of instructions" :key="index" class="text-xs">
                    {{ instructionStep.position }}. {{ instructionStep.text }}
                </li>
            </ol>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import type Recipe from '@/models/Recipe';
import type RecipeInstructionsStep from '@/models/RecipeInstructionsStep';

interface Data {
    instructions: RecipeInstructionsStep[];
}

export default defineComponent({
    props: {
        recipe: {
            type: Object as PropType<Recipe>,
            required: true,
        },
    },
    data(): Data {
        return { instructions: [] };
    },
    async created() {
        await this.recipe.loadRelationIfUnloaded('instructions');

        const instructions = this.recipe.instructions?.slice(0) ?? [];

        instructions.sort((a, b) => a.position - b.position);

        this.instructions = instructions;
    },
});
</script>
