<template>
    <li
        :class="[
            'flex overflow-hidden relative flex-col justify-end bg-gray-200 rounded-lg shadow aspect-w-5 aspect-h-2',
            'hover:opacity-75',
            visibleFocus && 'ring-2 ring-offset-2 ring-primary-500'
        ]"
    >
        <div class="flex absolute inset-0 justify-center items-center mix-blend-luminosity">
            <i-zondicons-photo class="w-full h-2/5 opacity-25" />
        </div>
        <div
            v-if="recipe.imageUrl"
            class="absolute inset-0 bg-center bg-cover"
            :style="`background-image: url('${recipe.imageUrl}')`"
        />
        <h2 class="z-10">
            <router-link
                v-focus-visible="setVisibleFocus"
                class="focus-visible:outline-none"
                :to="{ name: 'recipes.show', params: { recipe: recipe.uuid } }"
            >
                <span aria-hidden="true" class="absolute inset-0" />
                <span
                    v-if="recipe.name"
                    class="absolute inset-x-0 bottom-0 p-2 font-bold text-white bg-gradient-to-t to-transparent from-dark-overlay"
                >
                    {{ recipe.name }}
                </span>
            </router-link>
        </h2>
    </li>
</template>

<script setup lang="ts">
import { defineProps, ref } from 'vue';
import type { PropType } from 'vue';

import type Recipe from '@/models/Recipe';

defineProps({
    recipe: {
        type: Object as PropType<Recipe>,
        required: true,
    },
});

const visibleFocus = ref(false);

function setVisibleFocus(value: boolean) {
    visibleFocus.value = value;
}
</script>
