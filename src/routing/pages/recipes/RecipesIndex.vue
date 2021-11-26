<template>
    <main
        v-element-transitions="{
            enter: {
                'recipes.show': null,
                '*': $elementTransitions.fadeIn,
            },
            leave: {
                'recipes.show': $elementTransitions.waitChildrenTransitions,
                '*': $elementTransitions.fadeOut,
            },
        }"
        aria-labelledby="#cookbook-title"
        class="w-full mx-edge max-w-content"
    >
        <div class="flex justify-between">
            <BaseHeading id="cookbook-title">
                {{ $t('recipes.index.title') }}
            </BaseHeading>
            <BaseButton secondary route="recipes.create">
                <i-zondicons-add-solid class="mr-2 w-4 h-4" /> {{ $t('recipes.index.add') }}
            </BaseButton>
        </div>
        <RecipesGrid :recipes="$cookbook.recipes" class="w-full" />
    </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Cookbook from '@/services/facades/Cookbook';

export default defineComponent({
    beforeRouteEnter() {
        if (!Cookbook.recipes.isEmpty())
            return;

        return { name: 'home', replace: true };
    },
});
</script>
