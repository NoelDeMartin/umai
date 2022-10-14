<template>
    <div v-if="$viewer.list" class="flex flex-col flex-grow w-full px-edge">
        <div
            v-element-transitions="{
                transitions: {
                    'leave': leaveTransition,
                }
            }"
        >
            <router-link
                v-wobbly-border
                :to="{ name: 'home' }"
                title="Umai"
                aria-label="Umai"
                target="_blank"
                class="
                    flex self-center ring-primary-100 justify-center items-center space-x-2 mt-4
                    focus-visible:outline-none focus-visible:bg-primary-100 focus-visible:ring-8
                "
            >
                <i-app-umai class="mr-2 w-36 h-12 fill-primary-500" />
            </router-link>
            <h1 id="viewer-recipes-list-title" class="mt-4 text-xl font-semibold">
                {{ $viewer.list.name ?? $t('viewer.list.titleFallback') }}
            </h1>
            <CoreMarkdown v-if="$viewer.list.description" class="mt-2" :text="$viewer.list.description" />
            <ViewerRecipeCreator :list="$viewer.list" :prefix="$t('viewer.list.creatorPrefix')" />
        </div>
        <RecipesGrid :recipes="recipes" class="w-full" />
    </div>
</template>

<script setup lang="ts">
import { arrayFilter } from '@noeldemartin/utils';

import Viewer from '@/services/facades/Viewer';

import { leaveTransition } from './ViewerRecipes.transitions';

const recipes = $computed(() => arrayFilter(Viewer.list?.items?.map(item => item.recipe) ?? []));
</script>
