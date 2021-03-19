<template>
    <div class="flex items-center self-center justify-center flex-grow">
        <RecipeForm
            ref="form"
            @done="onCreated"
            @cancel="$router.back()"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, onMounted, ref } from 'vue';

import Router from '@/framework/core/facades/Router';

import Cookbook from '@/services/facades/Cookbook';
import type Recipe from '@/models/Recipe';

export default defineComponent({
    setup() {
        const form = ref<{ focus(): void }>();
        const onCreated = (recipe: Recipe) => {
            Cookbook.addRecipe(recipe);
            Router.push({
                name: 'recipes.show',
                params: { recipe: recipe.uuid as string },
            });
        };

        onMounted(async () => {
            await nextTick();

            form.value?.focus();
        });

        return { form, onCreated };
    },
});
</script>
