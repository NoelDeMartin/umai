<template>
    <main
        v-element-transitions="{
            enter: {
                'recipes.show': fadeInCookbookLink,
                '*': $elementTransitions.fadeIn,
            },
            leave: {
                'recipes.show': fadeOutCookbookLink,
                '*': $elementTransitions.fadeOut,
            },
        }"
        class="flex flex-col w-full max-w-content mx-edge"
        aria-labelledby="#home-title"
    >
        <HomeOnboarding v-if="$app.isOnboarding" />
        <HomeCreateCookbook v-else-if="$auth.loggedIn && !$cookbook.cookbook.isResolved()" />
        <HomeLanding v-else />
    </main>
</template>

<script setup lang="ts">
import { defineEnterTransition, defineLeaveTransition } from '@/framework/core/services/ElementTransitionsService';
import { fadeIn, fadeOut } from '@/framework/utils/transitions';

const fadeInCookbookLink = defineEnterTransition(async home => {
    const cookbookLink = home.querySelector('#home--cookbook-link');

    if (!cookbookLink)
        return;

    await fadeIn(cookbookLink as HTMLElement);
});

const fadeOutCookbookLink = defineLeaveTransition(async wrapper => {
    const cookbookLink = wrapper.querySelector('#home--cookbook-link');

    if (!cookbookLink)
        return;

    await fadeOut(cookbookLink as HTMLElement);
});
</script>
