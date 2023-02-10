<template>
    <AppPage :aria-labelledby="pageLabelId">
        <ViewerRecipe v-if="$viewer.recipe" />
        <ViewerRecipes v-else-if="$viewer.list" />

        <transition
            :enter-active-class="!$ui.animations || !starting ? 'transition duration-1000' : ''"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            :leave-active-class="!$ui.animations || !starting ? 'transition duration-1000' : ''"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <ViewerForm
                v-if="!$viewer.recipe && !$viewer.list"
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

    if (Viewer.list) {
        return 'viewer-recipes-list-title';
    }

    return 'viewer-form-title';
});
const routeTitle = $computed(() => {
    if (Viewer.recipe) {
        return Viewer.recipe.name;
    }

    if (Viewer.list?.name) {
        return Viewer.list.name;
    }

    return translate('viewer.title');
});

watch(Router.currentRoute, () => Viewer.view(Router.getQueryParam<{ url?: string }>('url')));
watch($$(routeTitle), title => updateRouteTitle(title), { immediate: true });

onMounted(() => starting && setTimeout(() => starting = false, 1000));
</script>
