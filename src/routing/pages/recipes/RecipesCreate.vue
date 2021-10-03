<template>
    <div class="flex flex-grow justify-center items-center self-center">
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

import type Recipe from '@/models/Recipe';

export default defineComponent({
    setup() {
        const form = ref<{ focus(): void }>();
        const onCreated = (recipe: Recipe) => {
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
