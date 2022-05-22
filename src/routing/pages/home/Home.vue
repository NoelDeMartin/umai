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
        class="mx-edge flex w-full max-w-content flex-col"
        aria-labelledby="#home-title"
    >
        <HomeCreateCookbook
            v-if="$auth.loggedIn && !$cookbook.cookbook.isResolved()"
        />
        <HomeOnboarding v-else-if="$cookbook.recipes.isEmpty()" />
        <HomeLanding v-else />
    </main>
</template>

<script setup lang="ts">
import {
    defineEnterTransition,
    defineLeaveTransition,
} from '@/framework/core/services/ElementTransitionsService';
import { fadeIn, fadeOut } from '@/framework/utils/transitions';

const fadeInCookbookLink = defineEnterTransition(async home => {
    const cookbookLink = home.querySelector('#home--cookbook-link');

    if (!cookbookLink) return;

    await fadeIn(cookbookLink as HTMLElement);
});

const fadeOutCookbookLink = defineLeaveTransition(async wrapper => {
    const cookbookLink = wrapper.querySelector('#home--cookbook-link');

    if (!cookbookLink) return;

    await fadeOut(cookbookLink as HTMLElement);
});
</script>
