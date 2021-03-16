<template>
    <div v-if="recipe" class="flex flex-col items-center justify-center flex-grow p-8 space-y-4">
        <h1 class="text-2xl">
            {{ recipe.name }}
        </h1>
        <p v-if="recipe.description" class="text-gray-700">
            {{ recipe.description }}
        </p>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Cookbook from '@/services/facades/Cookbook';

export default defineComponent({
    props: {
        uuid: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const recipe = Cookbook.recipes?.find(recipe => recipe.uuid === props.uuid);

        return { recipe };
    },
});
</script>
