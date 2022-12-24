<template>
    <AppPage
        :style="`margin-top: -${$ui.headerHeight}px`"
        aria-labelledby="recipe-form-title"
    >
        <RecipeForm
            :recipe="recipe"
            @done="onUpdated"
            @cancel="$router.push(recipe.route())"
        />
    </AppPage>
</template>

<script setup lang="ts">
import Cloud from '@/framework/core/facades/Cloud';
import Router from '@/framework/core/facades/Router';
import { requiredObjectProp } from '@/framework/utils/vue';

import type Recipe from '@/models/Recipe';

const { recipe } = defineProps({
    recipe: requiredObjectProp<Recipe>(),
});

async function onUpdated(recipe: Recipe) {
    await Router.push(recipe.route());
    await Cloud.syncIfOnline(recipe);
}
</script>
