<template>
    <main
        :aria-labelledby="viewerRecipe ? '#viewer-recipe-title' : '#viewer-form-title'"
        class="w-full"
    >
        <transition
            :enter-active-class="starting ? '' : 'transition duration-1000'"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            :leave-active-class="starting ? '' : 'transition duration-1000'"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <ViewerRecipe v-if="viewerRecipe" :recipe="viewerRecipe" />
            <ViewerForm
                v-else
                v-show="!starting"
                class="fixed inset-0 bg-white"
                @found-recipe="(recipe: Recipe) => viewerRecipe = recipe"
            />
        </transition>
    </main>
</template>

<script setup lang="ts">
import { hasLocationQueryParameter } from '@noeldemartin/utils';
import { onMounted } from 'vue';

import type Recipe from '@/models/Recipe';

let viewerRecipe = $ref<Recipe | null>(null);
let starting = $ref(hasLocationQueryParameter('url'));

onMounted(() => starting && setTimeout(() => starting = false, 1000));
</script>
