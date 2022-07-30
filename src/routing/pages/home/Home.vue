<template>
    <main
        v-element-transitions="{
            enter: {
                'recipes.show': () => $elementTransitions.waitElementsGone('recipe-details'),
                'recipes.create': () => $elementTransitions.waitElementsGone('recipe-form'),
                '*': $elementTransitions.fadeIn,
            },
            leave: {
                'recipes.show': () => $elementTransitions.waitElementsReady('recipe-details'),
                'recipes.create':() => $elementTransitions.waitElementsReady('recipe-form'),
                '*': $elementTransitions.fadeOut,
            },
        }"
        class="relative flex flex-col flex-grow max-w-content mx-edge"
        aria-labelledby="#home-title"
    >
        <HomeOnboarding v-if="$app.isOnboarding" />
        <HomeCreateCookbook v-else-if="$auth.loggedIn && !$cookbook.isReady" />
        <HomeCreateRecipe v-else-if="$cookbook.recipes.isEmpty()" />
        <HomeRecipes v-else />
    </main>
</template>

<script setup lang="ts"></script>
