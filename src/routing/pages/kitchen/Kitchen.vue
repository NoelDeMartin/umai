<template>
    <KitchenPage
        :title="$t('kitchen.index.title')"
        :show-kitchen-shortcut="false"
        :show-timers-shortcut="hasRunningTimers"
    >
        <ul class="grid grid-cols-1 gap-3 my-3 sm:grid-cols-2 md:grid-cols-3">
            <RecipeCard
                v-for="dish of $kitchen.dishes"
                :key="dish.recipe.url"
                :recipe="dish.recipe"
                :route="dish.getStageRoute()"
                :transitions="false"
            />
        </ul>
    </KitchenPage>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import Kitchen from '@/services/facades/Kitchen';

const hasRunningTimers = computed(() => Kitchen.timers.some(timer => timer.isRunning()));
</script>
