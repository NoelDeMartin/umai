<template>
    <RecipePage
        v-if="recipe"
        v-element-transitions="{
            name: 'viewer-recipe',
            id: recipe.url,
            transitions: {
                enter: enterTransition,
                leave: {
                    'recipes.edit': $elementTransitions.fadeOut,
                    'recipes.show': $elementTransitions.fadeOut,
                },
                'recipe-card': transitionToCard,
            },
        }"
        :recipe="recipe"
    >
        <template #title>
            <h1
                id="viewer-recipe-title"
                class="viewer-recipe--header-title text-4xl font-semibold text-white text-shadow"
            >
                <span class="viewer-recipe--header-title-text">{{ recipe.name }}</span>
            </h1>
        </template>

        <template #actions>
            <CoreButton
                v-if="recipeInCookbook"
                secondary
                route="recipes.show"
                :route-params="{ recipe: recipeInCookbook?.slug }"
            >
                {{ $t('viewer.recipe.inCookbook') }}
            </CoreButton>

            <CoreButton v-else secondary @click="importRecipe()">
                <i-pepicons-plus class="w-5 h-5" aria-hidden="true" />
                <span class="ml-1">{{ $t('viewer.recipe.import') }}</span>
            </CoreButton>

            <ViewerRecipeCreator
                v-if="collection"
                :prefix="$t('viewer.recipe.creatorPrefix')"
                :collection="collection"
            />

            <CoreLink
                v-if="collection"
                class="text-sm"
                route="viewer"
                :route-query="{ url: collection.url }"
            >
                {{ $t('viewer.recipe.viewAll') }}
            </CoreLink>
        </template>
    </RecipePage>
</template>

<script setup lang="ts">
import { arrayUnique, tap } from '@noeldemartin/utils';

import Browser from '@/framework/core/facades/Browser';
import Cloud from '@/framework/core/facades/Cloud';
import Router from '@/framework/core/facades/Router';
import UI from '@/framework/core/facades/UI';
import { translate } from '@/framework/utils/translate';
import { watchDebouncedEffect } from '@/framework/utils/vue';

import Cookbook from '@/services/facades/Cookbook';
import Recipe from '@/models/Recipe';
import Viewer from '@/services/facades/Viewer';

import { enterTransition, transitionToCard } from './ViewerRecipe.transitions';

const recipe = $computed(() => Viewer.recipe);
const list = $computed(() => recipe && recipe?.lists?.[0]);
const container = $computed(() => recipe && Viewer.getRecipeContainer(recipe));
const collection = $computed(() => list ?? container);
const recipeInCookbook = $computed(() => {
    if (!recipe?.url) {
        return null;
    }

    return Cookbook.recipes.find(
        localRecipe => localRecipe.url === recipe.url || localRecipe.externalUrls.includes(recipe.url),
    ) ?? null;
});

function showUnsupportedIndexedDBAlert() {
    const message = translate('errors.unsupportedBrowser_indexedDBFeature');
    const firefoxMessage = translate('errors.unsupportedBrowser_indexedDBFeatureFirefox');
    const small = (text: string) => `<span class="text-sm">${text}</span>`;

    UI.alert(
        translate('errors.unsupportedBrowser'),
        Browser.isFirefox
            ? `${message}\n\n${small(firefoxMessage)}`
            : message,
    );
}

async function importRecipe(): Promise<void> {
    if (!recipe) {
        return;
    }

    if (!Browser.supportsIndexedDB) {
        showUnsupportedIndexedDBAlert();

        return;
    }

    const remoteRecipe = tap(recipe.clone(), recipe => recipe.unloadRelation('lists'));
    const newRecipe = await Recipe.newFromJsonLD(remoteRecipe.toExternalJsonLD({ includeIds: false }));

    newRecipe.externalUrls = arrayUnique([...newRecipe.externalUrls, remoteRecipe.url]);

    await newRecipe.save();
    await Router.push({ name: 'home' });
    await Cloud.syncIfOnline(newRecipe);
}

watchDebouncedEffect($$(collection), 300, () => {
    if (list) {
        Viewer.preloadList(list);

        return;
    }

    if (recipe) {
        Viewer.preloadContainer(recipe.requireContainerUrl());

        return;
    }
});
</script>
