<template>
    <AppPage :aria-labelledby="pageLabelId">
        <ViewerRecipe v-if="$viewer.recipe" />
        <ViewerRecipes v-else-if="$viewer.list" />

        <transition
            :enter-active-class="starting ? '' : 'transition duration-1000'"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            :leave-active-class="starting ? '' : 'transition duration-1000'"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <ViewerForm
                v-if="!$viewer.recipe && !$viewer.list"
                v-show="!starting"
                class="fixed inset-0 bg-white z-10"
            />
        </transition>
    </AppPage>
</template>

<script setup lang="ts">
import { hasLocationQueryParameter } from '@noeldemartin/utils';
import { onMounted, watch } from 'vue';

import Router from '@/framework/core/facades/Router';

import Viewer from '@/services/facades/Viewer';

let starting = $ref(hasLocationQueryParameter('url'));

const pageLabelId = $computed(() => {
    if (Viewer.recipe) {
        return '#viewer-recipe-title';
    }

    if (Viewer.list) {
        return '#viewer-recipes-list-title';
    }

    return '#viewer-form-title';
});

watch(Router.currentRoute, () => Viewer.view(Router.getQueryParam<{ url?: string }>('url')));

onMounted(() => starting && setTimeout(() => starting = false, 1000));
</script>
