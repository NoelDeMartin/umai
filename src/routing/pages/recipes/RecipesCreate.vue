<template>
    <main
        class="w-full"
        :style="`margin-top: -${$ui.headerHeight}px`"
        aria-labelledby="#recipe-form-title"
    >
        <RecipeForm @done="onCreated" @cancel="$router.back()" />
    </main>
</template>

<script setup lang="ts">
import Cloud from '@/framework/core/facades/Cloud';
import Network from '@/framework/core/facades/Network';
import Router from '@/framework/core/facades/Router';

import type Recipe from '@/models/Recipe';

function onCreated(recipe: Recipe) {
    Network.online && Cloud.sync();

    Router.push({
        name: 'recipes.show',
        params: { recipe: recipe.uuid as string },
    });
}
</script>
