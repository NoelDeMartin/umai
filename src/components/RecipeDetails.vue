<template>
    <!-- TODO handle empty fields (image, description, etc.) -->
    <div class="flex justify-center items-end w-full h-80 bg-center bg-cover" :style="`background-image: url('${recipe.imageUrl}')`">
        <div class="pb-2 w-full max-w-content">
            <!-- TODO configure text shadow utils -->
            <h1 id="recipe-title" class="text-4xl font-semibold text-white" style="text-shadow: 0 2px 4px rgba(0,0,0,0.90);">
                {{ recipe.name }}
            </h1>
        </div>
    </div>
    <div class="flex justify-center mt-2">
        <div class="flex-grow max-w-content">
            <div class="flex">
                <div class="prose">
                    <!-- TODO support markdown -->
                    <p v-if="recipe.description">
                        {{ recipe.description }}
                    </p>
                    <p v-else>
                        No description
                    </p>
                    <h2>{{ $t('recipes.show.ingredients') }}</h2>
                    <ul>
                        <li v-for="(ingredient, index) of recipe.ingredients" :key="index">
                            {{ ingredient }}
                        </li>
                    </ul>
                    <h2>{{ $t('recipes.show.instructions') }}</h2>
                    <ol>
                        <li v-for="instructionStep of recipe.instructions" :key="instructionStep.position">
                            {{ instructionStep.text }}
                        </li>
                    </ol>
                </div>
                <div>
                    <div class="flex-grow self-start p-4 shadow">
                        TODO servings, timings, etc.
                    </div>
                    <BaseButton class="!justify-start mt-2 w-full" route="recipes.edit" :route-params="{ recipe: recipe.uuid }">
                        <i-zondicons-edit-pencil class="mr-2 w-4 h-4" /> {{ $t('recipes.edit') }}
                    </BaseButton>
                    <BaseButton class="!justify-start mt-2 w-full">
                        <i-zondicons-trash class="mr-2 w-4 h-4" /> {{ $t('recipes.delete') }}
                    </BaseButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import type { PropType } from 'vue';

import type Recipe from '@/models/Recipe';

defineProps({
    recipe: {
        type: Object as PropType<Recipe>,
        required: true,
    },
});
</script>
