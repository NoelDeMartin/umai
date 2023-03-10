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
            <RecipeTitle id="viewer-recipe-title" :recipe="recipe" />
        </template>

        <template #actions>
            <div class="flex flex-col items-start gap-y-2">
                <CoreButton
                    v-if="recipeInCookbook"
                    secondary
                    route="recipes.show"
                    :route-params="{ recipe: recipeInCookbook?.slug }"
                >
                    <i-pepicons-book class="w-4 h-4" aria-hidden="true" />
                    <span class="ml-2">{{ $t('viewer.recipe.inCookbook') }}</span>
                </CoreButton>

                <CoreButton v-else secondary @click="importRecipe()">
                    <i-pepicons-plus class="w-5 h-5" aria-hidden="true" />
                    <span class="ml-1">{{ $t('viewer.recipe.import') }}</span>
                </CoreButton>

                <div v-if="$browser.supportsPrinting">
                    <CoreButton secondary @click="printRecipe()">
                        <i-pepicons-file class="w-4 h-4" aria-hidden="true" />
                        <span class="ml-2">{{ $t('recipes.print') }}</span>
                    </CoreButton>

                    <CoreButton
                        clear
                        :title="$t('viewer.recipe.print_help')"
                        :aria-label="$t('viewer.recipe.print_help')"
                        @click="$ui.showMarkdown($t('viewer.recipe.print_info'))"
                    >
                        <i-pepicons-question-circle class="w-5 h-5" aria-hidden="true" />
                    </CoreButton>
                </div>
            </div>

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

function printRecipe() {
    window.print();
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
