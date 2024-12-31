<template>
    <div class="fixed bottom-0 left-0 right-0 pointer-events-none p-4 z-30 print:hidden md:p-8">
        <div class="max-w-content px-edge w-full m-auto flex justify-center md:justify-end">
            <Transition
                enter-active-class="transition-transform duration-500 delay-1000"
                enter-from-class="translate-y-[200%]"
                enter-to-class="translate-y-0"
                leave-active-class="transition-transform duration-500"
                leave-from-class="translate-y-0"
                leave-to-class="translate-y-[200%]"
            >
                <div v-if="$kitchen.dish">
                    <CoreButton class="pointer-events-auto h-12" @click="$kitchen.open()">
                        <i-tabler-chef-hat-filled class="w-5 h-5 ml-2" aria-hidden="true" />
                        <span class="mx-2 uppercase tracking-wider font-semibold text-sm">{{ $t('kitchen.open') }}</span>
                    </CoreButton>
                </div>
                <div v-else-if="$kitchen.show && recipe" class="flex flex-col space-y-1 items-center">
                    <CoreButton class="pointer-events-auto h-12" @click="recipe && $kitchen.cook(recipe)">
                        <i-tabler-chef-hat-filled class="w-5 h-5 ml-2" aria-hidden="true" />
                        <span class="mx-2 uppercase tracking-wider font-semibold text-sm">{{ $t('kitchen.cook') }}</span>
                    </CoreButton>
                    <CoreButton clear class="pointer-events-auto" @click="$kitchen.dismiss()">
                        <span class="text-sm">{{ $t('kitchen.dismiss') }}</span>
                    </CoreButton>
                </div>
            </Transition>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import Router from '@/framework/core/facades/Router';

import Cookbook from '@/services/facades/Cookbook';

const recipe = computed(() => {
    return Cookbook.recipes.first(recipe => recipe.slug === Router.currentRoute.value.params.recipe);
});
</script>
