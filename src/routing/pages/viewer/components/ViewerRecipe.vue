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
            <CoreMarkdown
                v-if="$viewer.recipeInCookbook"
                :text="$t('viewer.recipe.inCookbook')"
                :actions="{
                    'view-in-cookbook': () => Router.push({
                        name: 'recipes.show',
                        params: { recipe: $viewer.recipeInCookbook?.uuid },
                    }),
                }"
            />
            <CoreButton v-else secondary @click="importRecipe()">
                <i-pepicons-plus class="w-5 h-5" aria-hidden="true" />
                <span class="ml-1">{{ $t('viewer.recipe.import') }}</span>
            </CoreButton>

            <CoreMarkdown
                v-if="creator"
                class="text-sm mt-4"
                :text="$t('viewer.recipe.creator', creator)"
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
import { silenced, tap, urlClean } from '@noeldemartin/utils';

import Auth from '@/framework/core/facades/Auth';
import Cloud from '@/framework/core/facades/Cloud';
import Network from '@/framework/core/facades/Network';
import Router from '@/framework/core/facades/Router';
import { computedAsync } from '@/framework/utils/vue';

import Recipe from '@/models/Recipe';
import Viewer from '@/services/facades/Viewer';

import { enterTransition, transitionToCard } from './ViewerRecipe.transitions';

const list = $computed(() => Viewer.recipe?.lists?.[0]);
const creator = $(computedAsync(async () => {
    if (!list) {
        return null;
    }

    const user = await silenced(Auth.getUserProfile(list.creatorWebId));

    return {
        name: user?.name ?? urlClean(user?.webId ?? list.creatorWebId, { protocol: false }),
        url: user?.webId ?? list.creatorWebId,
    };
}));

async function importRecipe(): Promise<void> {
    if (!Viewer.recipe) {
        return;
    }

    const remoteRecipe = tap(Viewer.recipe.clone(), recipe => recipe.unloadRelation('lists'));
    const recipe = await Recipe.newFromJsonLD(remoteRecipe.toExternalJsonLD(false));

    recipe.externalUrls = [...recipe.externalUrls, remoteRecipe.url];

    await recipe.save();
    await Router.push({ name: 'home' });
    await (Network.online && Cloud.sync(recipe));
}
</script>
