<template>
    <RecipePage
        v-if="$viewer.recipe"
        v-element-transitions="{
            name: 'viewer-recipe',
            id: $viewer.recipe.url,
            transitions: {
                enter: enterTransition,
                leave: {
                    'recipes.edit': $elementTransitions.fadeOut,
                    'recipes.show': $elementTransitions.fadeOut,
                },
                'recipe-card': transitionToCard,
            },
        }"
        :recipe="$viewer.recipe"
    >
        <template #title>
            <h1
                id="viewer-recipe-title"
                class="viewer-recipe--header-title text-4xl font-semibold text-white text-shadow"
            >
                <span class="viewer-recipe--header-title-text">{{ $viewer.recipe.name }}</span>
            </h1>
        </template>

        <template #actions>
            <CoreButton
                v-if="$viewer.recipeInCookbook"
                secondary
                route="recipes.show"
                :route-params="{ recipe: $viewer.recipeInCookbook?.slug }"
            >
                {{ $t('viewer.recipe.inCookbook') }}
            </CoreButton>

            <CoreButton v-else secondary @click="importRecipe()">
                <i-pepicons-plus class="w-5 h-5" aria-hidden="true" />
                <span class="ml-1">{{ $t('viewer.recipe.import') }}</span>
            </CoreButton>

            <ViewerRecipeCreator
                v-if="list"
                :prefix="$t('viewer.recipe.creatorPrefix')"
                :list="list"
            />

            <CoreLink
                v-if="list"
                class="text-sm"
                route="viewer"
                :route-query="{ url: list.url }"
            >
                {{ $t('viewer.recipe.viewAll') }}
            </CoreLink>
        </template>
    </RecipePage>
</template>

<script setup lang="ts">
import { tap } from '@noeldemartin/utils';

import Browser from '@/framework/core/facades/Browser';
import Cloud from '@/framework/core/facades/Cloud';
import Router from '@/framework/core/facades/Router';
import UI from '@/framework/core/facades/UI';
import { translate } from '@/framework/utils/translate';

import Recipe from '@/models/Recipe';
import Viewer from '@/services/facades/Viewer';

import { enterTransition, transitionToCard } from './ViewerRecipe.transitions';

const list = $computed(() => Viewer.recipe?.lists?.[0]);

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
    if (!Viewer.recipe) {
        return;
    }

    if (!Browser.supportsIndexedDB) {
        showUnsupportedIndexedDBAlert();

        return;
    }

    const remoteRecipe = tap(Viewer.recipe.clone(), recipe => recipe.unloadRelation('lists'));
    const recipe = await Recipe.newFromJsonLD(remoteRecipe.toExternalJsonLD(false));

    recipe.externalUrls = [...recipe.externalUrls, remoteRecipe.url];

    await recipe.save();
    await Router.push({ name: 'home' });
    await Cloud.syncIfOnline(recipe);
}
</script>
