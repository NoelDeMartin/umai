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
import { computed, ref } from 'vue';

import Cookbook from '@/services/facades/Cookbook';

const shuffle = ref({ count: 8 });
const showcasedRecipes = computed(() => Cookbook.recipes.randomItems(shuffle.value.count));

function shuffleShowcase() {
    shuffle.value = { count: 8 };
}
</script>
