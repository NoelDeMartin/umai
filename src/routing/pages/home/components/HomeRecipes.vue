<template>
    <div class="flex flex-col flex-grow w-full">
        <div class="flex justify-between items-center relative">
            <HomeHeading>
                {{ title }}
            </HomeHeading>
            <div class="flex-grow" />
            <transition
                :enter-active-class="$ui.animations ? 'transition duration-300' : ''"
                enter-from-class="opacity-0"
                enter-to-class="opacity-100"
                :leave-active-class="$ui.animations ? 'transition duration-300' : ''"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
            >
                <CoreButton
                    v-if="$ui.isDesktop && !searching && !search"
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
        <RecipesGrid :recipes="filteredRecipes" class="w-full" />
        <transition
            enter-to-class="opacity-100"
            :enter-active-class="$ui.animations ? 'transition-opacity duration-500' : ''"
            enter-from-class="opacity-0"
            leave-to-class="opacity-0"
            :leave-active-class="$ui.animations ? 'transition-opacity duration-500' : ''"
            leave-from-class="opacity-100"
        >
            <div
                v-if="filteredRecipes.length === 0"
                class="absolute top-24 bottom-0 inset-x-0 flex-grow items-center justify-center flex"
            >
                <div class="prose">
                    <CoreMarkdown
                        class="text-2xl font-medium tracking-wide leading-snug text-center"
                        :text="$t('home.recipes.empty', { search: trimmedSearch })"
                    />
                </div>
            </div>
        </transition>
        <HomeRecipesFAB v-if="$ui.isMobile" />
    </div>
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
const trimmedSearch = $computed(() => search.trim());
const filteredRecipes = $computed(() => {
    const searchQuery = stringToSlug(trimmedSearch).replaceAll('-', '');
    const filteredSearchIndex = searchQuery.length
        ? searchIndex.filter(({ searchableText }) => searchableText.includes(searchQuery))
        : searchIndex;

    return filteredSearchIndex.map(({ recipe }) => recipe).toArray();
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
