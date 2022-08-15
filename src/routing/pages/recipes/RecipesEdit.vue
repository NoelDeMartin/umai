<template>
    <AppPage
        :style="`margin-top: -${$ui.headerHeight}px`"
        aria-labelledby="#recipe-form-title"
    >
        <RecipeForm
            :recipe="recipe"
            @done="onUpdated"
            @cancel="$router.push({ name: 'recipes.show', params: { recipe: recipe.uuid as string } })"
        />
    </AppPage>
</template>

<script setup lang="ts">
import Cloud from '@/framework/core/facades/Cloud';
import Network from '@/framework/core/facades/Network';
import Router from '@/framework/core/facades/Router';
import { requiredObjectProp } from '@/framework/utils/vue';

import type Recipe from '@/models/Recipe';

const { recipe } = defineProps({
    recipe: requiredObjectProp<Recipe>(),
});

function onUpdated(recipe: Recipe) {
    Network.online && Cloud.sync(recipe);

    Router.push({
        name: 'recipes.show',
        params: { recipe: recipe.uuid as string },
    });
}
</script>
