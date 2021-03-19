<template>
    <div class="flex items-center self-center justify-center flex-grow">
        <RecipeForm
            ref="form"
            :recipe="recipe"
            @done="$router.push({ name: 'recipes.show', params: { recipe: $event.uuid } })"
            @cancel="$router.back()"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, onMounted, ref } from 'vue';
import type { PropType } from 'vue';

import type Recipe from '@/models/Recipe';

export default defineComponent({
    props: {
        recipe: {
            type: Object as PropType<Recipe>,
            required: true,
        },
    },
    setup() {
        const form = ref<{ focus(): void }>();

        onMounted(async () => {
            await nextTick();

            form.value?.focus();
        });

        return { form };
    },
});
</script>
