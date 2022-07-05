<template>
    <main
        class="flex flex-col w-full min-h-screen"
        :style="`margin-top: -${$ui.headerHeight}px`"
        aria-labelledby="#recipe-form-title"
    >
        <RecipeForm
            :recipe="recipe"
            @done="onCreated"
            @cancel="$router.back()"
        />
    </main>
</template>

<script setup lang="ts">
import Cloud from '@/framework/core/facades/Cloud';
import Network from '@/framework/core/facades/Network';
import Router from '@/framework/core/facades/Router';
import UI from '@/framework/core/facades/UI';

import Cookbook from '@/services/facades/Cookbook';

const recipe = Cookbook.getTmpRecipe(history.state.tmpRecipe);

async function onCreated() {
    UI.scrollLayout({ top: 0 });
    Router.push({ name: 'home' });

    await (Network.online && Cloud.sync());
}
</script>
