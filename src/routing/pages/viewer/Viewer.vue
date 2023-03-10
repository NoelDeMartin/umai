<template>
    <AppPage
        style="margin-top: calc(-1 * var(--header-height))"
        :aria-labelledby="pageLabelId"
    >
        <ViewerRecipe v-if="$viewer.recipe" />
        <ViewerRecipes v-else-if="$viewer.collection" />

        <transition
            :enter-active-class="!$ui.animations || !starting ? 'transition duration-1000' : ''"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            :leave-active-class="!$ui.animations || !starting ? 'transition duration-1000' : ''"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <ViewerForm
                v-if="!$viewer.recipe && !$viewer.collection"
                v-show="!starting"
            />
        </transition>
    </AppPage>
</template>

<script setup lang="ts">
import { hasLocationQueryParameter } from '@noeldemartin/utils';
import { onMounted, watch } from 'vue';

import Router from '@/framework/core/facades/Router';
import { updateRouteTitle } from '@/framework/routing/router';

import Viewer from '@/services/facades/Viewer';
import { translate } from '@/framework/utils/translate';

let starting = $ref(hasLocationQueryParameter('url'));

const pageLabelId = $computed(() => {
    if (Viewer.recipe) {
        return 'viewer-recipe-title';
    }

    if (Viewer.collection) {
        return 'viewer-recipes-collection-title';
    }

    return 'viewer-form-title';
});
const routeTitle = $computed(() => {
    if (Viewer.recipe) {
        return Viewer.recipe.name;
    }

    if (Viewer.collection?.name) {
        return Viewer.collection.name;
    }

    return translate('viewer.title');
});

watch(Router.currentRoute, () => Viewer.view(Router.getQueryParam<{ url?: string }>('url')));
watch($$(routeTitle), title => updateRouteTitle(title), { immediate: true });

onMounted(() => starting && setTimeout(() => starting = false, 1000));
</script>
