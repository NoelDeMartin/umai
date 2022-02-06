<template>
    <div class="flex justify-between">
        <BaseHeading id="home-title">
            {{ $t('home.title') }}
        </BaseHeading>
        <BaseButton clear @click="shuffleShowcase">
            <i-zondicons-reload class="mr-2 w-4 h-4" />
            {{ $t('home.shuffle') }}
        </BaseButton>
    </div>
    <RecipesGrid :recipes="showcasedRecipes" />
    <BaseLink id="home--cookbook-link" class="self-end" route="recipes.index">
        {{ $t('home.cookbook_link') }}<span aria-hidden="true"> &rarr;</span>
    </BaseLink>
</template>

<script setup lang="ts">
import Cookbook from '@/services/facades/Cookbook';

let shuffle = $ref({ count: 8 });
const showcasedRecipes = $computed(() => Cookbook.recipes.randomItems(shuffle.count));

function shuffleShowcase() {
    shuffle = { count: 8 };
}
</script>
