<template>
    <BaseHeading id="home-title">
        {{ $t('home.title') }}
    </BaseHeading>
    <RecipesGrid :recipes="recipes" />
    <BaseLink id="home--cookbook-link" class="self-end" route="recipes.index">
        {{ $t('home.cookbook_link') }}<span aria-hidden="true"> &rarr;</span>
    </BaseLink>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import Cookbook from '@/services/facades/Cookbook';

const recipes = computed(() => Cookbook.recipes.slice(0, 8));
</script>
