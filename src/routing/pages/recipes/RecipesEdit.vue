<template>
    <main class="w-full" :style="`margin-top: -${$ui.headerHeight}px`" aria-labelledby="#recipe-form-title">
        <RecipeForm
            :recipe="recipe"
            @done="onUpdated"
            @cancel="$router.back()"
        />
    </main>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';

import Cloud from '@/framework/core/facades/Cloud';
import Router from '@/framework/core/facades/Router';

import type Recipe from '@/models/Recipe';

const props = defineProps({
    recipe: {
        type: Object as PropType<Recipe>,
        required: true,
    },
});

function onUpdated() {
    Cloud.sync();
    Router.push({
        name: 'recipes.show',
        params: { recipe: props.recipe.uuid as string },
    });
}
</script>
