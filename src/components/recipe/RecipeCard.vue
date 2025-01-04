<template>
    <li
        v-element-transitions="transitionsConfig"
        :data-recipe-url="recipe.url"
        :class="[
            'flex overflow-hidden relative flex-col justify-end rounded-lg shadow aspect-[5/2]',
            'hover:opacity-75',
            visibleFocus && 'ring-2 ring-offset-2 ring-primary-500',
        ]"
    >
        <RecipeImage :recipe="recipe" class="absolute inset-0" />
        <h2 class="z-10 text-lg font-bold text-white">
            <router-link
                v-focus-visible="setVisibleFocus"
                class="block w-full h-clickable focus-visible:outline-none"
                :to="route ?? recipe.route($viewer.active ? 'viewer' : 'show')"
            >
                <span aria-hidden="true" class="absolute inset-0" />
                <div v-if="recipe.name" class="absolute inset-x-0 bottom-0 p-2 recipe-card--title-wrapper">
                    <div class="absolute inset-0 bg-gradient-to-t to-transparent from-dark-overlay recipe-card--title-background" />
                    <span class="relative recipe-card--title-text">{{ recipe.name }}</span>
                </div>
            </router-link>
        </h2>
    </li>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RouteLocationRaw } from 'vue-router';

import { booleanProp, objectProp, requiredObjectProp } from '@/framework/utils/vue';

import type Recipe from '@/models/Recipe';

import {
    enterTransition,
    leaveTransition,
    transitionToCard,
    transitionToDetails,
    transitionToViewer,
} from './RecipeCard.transitions';

const props = defineProps({
    recipe: requiredObjectProp<Recipe>(),
    route: objectProp<RouteLocationRaw>(),
    transitions: booleanProp(true),
});

let visibleFocus = $ref(false);
const transitionsConfig = computed(() => {
    if (!props.transitions) {
        return;
    }

    return {
        name: 'recipe-card',
        id: props.recipe.url,
        transitions: {
            'enter': enterTransition,
            'leave': leaveTransition,
            'recipe-card': transitionToCard,
            'recipe-details': transitionToDetails,
            'viewer-recipe': transitionToViewer,
        },
    };
});

function setVisibleFocus(value: boolean) {
    visibleFocus = value;
}
</script>
