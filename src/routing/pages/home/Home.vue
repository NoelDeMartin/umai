<template>
    <AppPage
        v-element-transitions="{
            enter: {
                'recipes.show': () => $elementTransitions.waitElementsGone('recipe-details'),
                'recipes.create': () => $elementTransitions.waitElementsGone('recipe-form'),
                'kitchen': noop,
                'kitchen.instructions': noop,
                'kitchen.ingredients': noop,
                'kitchen.completed': noop,
                '*': $elementTransitions.fadeIn,
            },
            leave: {
                'recipes.show': () => $elementTransitions.waitElementsReady('recipe-details'),
                'recipes.create':() => $elementTransitions.waitElementsReady('recipe-form'),
                'kitchen': () => after({ ms: KITCHEN_TRANSITION_DURATION }),
                'kitchen.instructions': () => after({ ms: KITCHEN_TRANSITION_DURATION }),
                'kitchen.ingredients': () => after({ ms: KITCHEN_TRANSITION_DURATION }),
                'kitchen.completed': () => after({ ms: KITCHEN_TRANSITION_DURATION }),
                '*': $elementTransitions.fadeOut,
            },
        }"
        class="px-edge"
        aria-labelledby="home-title"
    >
        <HomeOnboarding v-if="$app.isOnboarding" />
        <HomeCreateCookbook v-else-if="$auth.loggedIn && !$cookbook.created" />
        <HomeCreateRecipe v-else-if="$cookbook.recipes.isEmpty()" />
        <HomeRecipes v-else />
    </AppPage>
</template>

<script setup lang="ts">
import { after, noop } from '@noeldemartin/utils';
import { KITCHEN_TRANSITION_DURATION } from '../kitchen/constants';
</script>
