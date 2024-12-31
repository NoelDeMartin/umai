<template>
    <div class="fixed inset-0 bg-white z-40">
        <CoreButton
            clear
            class="absolute right-4 top-4 md:right-8 md:top-8"
            :title="$t('kitchen.close')"
            @click="$kitchen.close()"
        >
            <i-pepicons-times class="w-8 h-8" aria-hidden="true" />
            <span class="sr-only">{{ $t('kitchen.close') }}</span>
        </CoreButton>

        <div class="w-full h-full overflow-auto">
            <div class="mx-auto max-w-4xl pt-8 pb-8 px-edge md:pt-16 min-h-full flex flex-col">
                <h1 class="text-2xl font-semibold">
                    {{ title }}
                </h1>

                <slot />
            </div>
        </div>

        <div class="fixed top-32 right-12 flex flex-col space-y-4">
            <CoreButton
                v-if="recipe && showIngredientsShortcut"
                secondary
                route="kitchen.ingredients"
                :route-params="{ recipe: recipe.slug }"
            >
                <i-pepicons-list class="w-8 h-8" aria-hidden="true" />
                <span class="sr-only">{{ $t('kitchen.ingredients.show') }}</span>
            </CoreButton>
            <CoreButton
                v-if="showTimersShortcut"
                secondary
                class="relative"
                @click="$ui.openModal(KitchenTimersModal)"
            >
                <i-pepicons-alarm class="w-8 h-8" aria-hidden="true" />
                <span class="sr-only">{{ $t('kitchen.timers.show') }}</span>
                <div v-if="hasOverTimeTimers" class="w-4 h-4 absolute -top-1 -right-1 rounded-full bg-red-800">
                    <span class="sr-only">
                        ({{ $t('kitchen.timers.overtime') }})
                    </span>
                </div>
            </CoreButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { booleanProp, objectProp, requiredStringProp } from '@/framework/utils/vue';

import Kitchen from '@/services/facades/Kitchen';
import type Recipe from '@/models/Recipe';

import KitchenTimersModal from './modals/KitchenTimersModal.vue';

defineProps({
    title: requiredStringProp(),
    recipe: objectProp<Recipe>(),
    showIngredientsShortcut: booleanProp(true),
    showTimersShortcut: booleanProp(true),
});

const hasOverTimeTimers = computed(() => Kitchen.timers.some(timer => timer.isOverTime()));
</script>
