<template>
    <main
        v-element-transitions="{
            blocking: ({ name }: { name: string }) => name !== 'recipe-details',
            transitions: {
                enter: {
                    'recipes.show': null,
                    '*': $elementTransitions.fadeIn,
                },
                leave: {
                    'recipes.show': $elementTransitions.waitChildrenTransitions,
                    '*': $elementTransitions.fadeOut,
                },
            },
        }"
        aria-labelledby="#cookbook-title"
        class="w-full mx-edge max-w-content"
    >
        <div class="flex justify-between">
            <BaseHeading id="cookbook-title">
                {{ $t('recipes.index.title') }}
            </BaseHeading>
            <BaseSearchInput
                v-model="search"
                :label="$t('recipes.index.search_label')"
                :placeholder="$t('recipes.index.search_placeholder')"
            />
        </div>
        <RecipesGrid :recipes="filteredRecipes" class="w-full" />
        <div class="flex fixed right-0 bottom-0 z-40 justify-center p-5 w-screen pointer-events-none recipes-index--fab">
            <div class="flex justify-center w-full">
                <div class="w-clickable" />
                <div class="mx-4 w-full max-w-content" />
                <BaseFloatingActionButton
                    class="pointer-events-auto"
                    :label="$t('recipes.index.add')"
                    @click="$ui.openModal(CreateRecipeModal)"
                />
            </div>
        </div>
    </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { stringToSlug } from '@noeldemartin/utils';

import Cookbook from '@/services/facades/Cookbook';
import CreateRecipeModal from '@/components/modals/CreateRecipeModal.vue';

export default defineComponent({
    async beforeRouteEnter() {
        await Cookbook.ready;

        if (!Cookbook.recipes.isEmpty())
            return;

        return { name: 'home', replace: true };
    },
});
</script>

<script setup lang="ts">
const search = $ref('');
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
</script>
