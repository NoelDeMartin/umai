<template>
    <main
        v-element-transitions="{ leave: leaveTransition }"
        aria-labelledby="#cookbook-title"
        class="w-full mx-edge max-w-content"
    >
        <div class="flex justify-between">
            <h1 id="cookbook-title" class="text-2xl font-semibold">
                {{ $t('recipes.index.title') }}
            </h1>
            <BaseButton secondary route="recipes.create">
                <i-zondicons-add-solid class="mr-2 w-4 h-4" /> {{ $t('recipes.index.add') }}
            </BaseButton>
        </div>
        <p v-if="!$cookbook.recipes">
            <i-umai-loading-dots class="w-16 h-12 text-indigo-500" />
        </p>
        <p v-else-if="$cookbook.recipes.isEmpty()">
            {{ $t('recipes.index.empty') }}
        </p>
        <RecipesGrid v-else :recipes="$cookbook.recipes" class="w-full" />
    </main>
</template>

<script setup lang="ts">
import ElementTransitions from '@/framework/core/facades/ElementTransitions';
import { defineLeaveTransition } from '@/framework/core/services/ElementTransitionsService';
import { updateElement } from '@/framework/utils/dom';

const leaveTransition = defineLeaveTransition(async (_, el) => {
    updateElement(el, { removeClasses: 'mx-edge' });

    await ElementTransitions.afterChildrenTransitions(el);
});
</script>
