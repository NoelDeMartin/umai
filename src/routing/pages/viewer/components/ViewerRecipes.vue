<template>
    <div v-if="$viewer.list" class="flex flex-col flex-grow w-full px-edge">
        <h1 id="viewer-recipes-list-title" class="my-2 text-xl font-semibold">
            {{ $viewer.list.name ?? $t('viewer.list.titleFallback') }}
        </h1>
        <CoreMarkdown
            v-if="creator"
            class="text-sm mt-4"
            :text="$viewer.list.description ?? $t('viewer.list.creator', creator)"
        />
        <RecipesGrid :recipes="recipes" class="w-full" />
    </div>
</template>

<script setup lang="ts">
import { arrayFilter, silenced, urlClean } from '@noeldemartin/utils';

import Auth from '@/framework/core/facades/Auth';
import { computedAsync } from '@/framework/utils/vue';

import Viewer from '@/services/facades/Viewer';

const recipes = $computed(() => arrayFilter(Viewer.list?.items?.map(item => item.recipe) ?? []));
const creator = $(computedAsync(async () => {
    if (!Viewer.list) {
        return null;
    }

    const user = await silenced(Auth.getUserProfile(Viewer.list.creatorWebId));

    return {
        name: user?.name ?? urlClean(user?.webId ?? Viewer.list.creatorWebId, { protocol: false }),
        url: user?.webId ?? Viewer.list.creatorWebId,
    };
}));
</script>
