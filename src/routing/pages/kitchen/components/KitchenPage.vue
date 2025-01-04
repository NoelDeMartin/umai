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
            <div class="mx-auto max-w-4xl pt-4 pb-8 px-edge md:pt-10 min-h-full flex flex-col">
                <template v-if="recipe">
                    <h1 class="text-gray-500 opacity-50 font-medium tracking-wide uppercase text-xs">
                        {{ $t('kitchen.title', { recipe: recipe.name }) }}
                    </h1>
                    <h2 class="text-2xl font-semibold mt-4">
                        {{ title }}
                    </h2>
                </template>

                <h1 v-else class="text-2xl font-semibold mt-4">
                    {{ title }}
                </h1>

                <slot />
            </div>
        </div>

        <div class="fixed top-32 right-12 flex flex-col space-y-4">
            <CoreButton
                v-if="showKitchenShortcut && $kitchen.dishes.length > 1"
                :title="$t('kitchen.index.show')"
                route="kitchen"
                secondary
            >
                <i-tabler-chef-hat-filled class="w-7 h-7" aria-hidden="true" />
                <span class="sr-only">{{ $t('kitchen.index.show') }}</span>
            </CoreButton>
            <CoreButton
                v-if="showTimersShortcut"
                :title="$t('kitchen.timers.show')"
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
            <CoreButton
                v-if="showIngredientsShortcut && recipe"
                :route-params="{ recipe: recipe.slug }"
                :title="$t('kitchen.ingredients.show')"
                route="kitchen.ingredients"
                secondary
            >
                <i-pepicons-list class="w-8 h-8" aria-hidden="true" />
                <span class="sr-only">{{ $t('kitchen.ingredients.show') }}</span>
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
    showKitchenShortcut: booleanProp(true),
    showTimersShortcut: booleanProp(true),
    showIngredientsShortcut: booleanProp(true),
});

const hasOverTimeTimers = computed(() => Kitchen.timers.some(timer => timer.isOverTime()));
</script>
