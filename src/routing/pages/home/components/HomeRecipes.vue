<template>
    <div class="flex justify-between items-center relative">
        <HomeHeading>
            {{ title }}
        </HomeHeading>
        <div class="flex-grow" />
        <transition
            enter-active-class="transition duration-300"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition duration-300"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <CoreButton
                v-if="$ui.isDesktop && !searching"
                class="mr-14 h-9"
                @click="$ui.openModal(CreateRecipeModal)"
            >
                <i-pepicons-plus class="w-5 h-5" aria-hidden="true" />
                <span class="ml-1 font-semibold uppercase text-xs tracking-wider">{{ $t('home.recipes.create') }}</span>
            </CoreButton>
        </transition>
        <CoreSearchBox
            v-model="search"
            class="!absolute right-0 top-1/2 -translate-y-1/2"
            :label="$t('home.recipes.search_label')"
            :placeholder="$t('home.recipes.search_placeholder')"
            @focus="searching = true"
            @blur="searching = false"
        />
    </div>
    <RecipeCreateOptions v-if="$cookbook.recipes.isEmpty()" />
    <template v-else>
        <RecipesGrid :recipes="filteredRecipes" class="w-full" />
        <div
            v-if="$ui.isMobile"
            class="flex fixed right-0 bottom-0 z-40 justify-center p-5 w-screen pointer-events-none recipes-index--fab"
        >
            <div class="flex justify-center w-full">
                <div class="w-clickable" />
                <div class="mx-4 w-full max-w-content" />
                <BaseFloatingActionButton
                    class="pointer-events-auto"
                    :label="$t('home.recipes.create')"
                    @click="$ui.openModal(CreateRecipeModal)"
                />
            </div>
        </div>
    </template>
</template>

<script setup lang="ts">
import { arrayRandomItem, stringToSlug } from '@noeldemartin/utils';

import I18n from '@/framework/core/facades/I18n';
import { translate } from '@/framework/utils/translate';

import Cookbook from '@/services/facades/Cookbook';
import CreateRecipeModal from '@/components/modals/CreateRecipeModal.vue';

let search = $ref('');
let searching = $ref(false);
const title = getTitle();
const searchIndex = $computed(() => Cookbook.recipes.map(recipe => ({
    recipe,
    searchableText: stringToSlug(recipe.name).replaceAll('-', ''),
})));
const filteredRecipes = $computed(() => {
    const searchQuery = search.trim();
    const filteredSearchIndex = searchQuery.length
        ? searchIndex.filter(({ searchableText }) => searchableText.includes(searchQuery))
        : searchIndex;

    return filteredSearchIndex.map(({ recipe }) => recipe);
});

function getTitle(): string {
    const titles = [];

    for (let i = 0; ; i++) {
        const key = `home.recipes.title.${i}`;

        if (!I18n.hasMessage(key)) {
            break;
        }

        titles.push(translate(key));
    }

    return arrayRandomItem(titles) || '';
}
</script>
