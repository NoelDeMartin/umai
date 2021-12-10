<template>
    <main class="w-full" :style="`margin-top: -${$ui.headerHeight}px`" aria-labelledby="#recipe-form-title">
        <RecipeForm @done="onCreated" @cancel="$router.back()" />
    </main>
</template>

<script setup lang="ts">
import Router from '@/framework/core/facades/Router';

import type Recipe from '@/models/Recipe';

function onCreated(recipe: Recipe) {
    Router.push({
        name: 'recipes.show',
        params: { recipe: recipe.uuid as string },
    });
}
</script>
