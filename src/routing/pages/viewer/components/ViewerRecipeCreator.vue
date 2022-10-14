<template>
    <p v-if="creator" class="prose text-sm mt-2 flex items-center space-x-1.5 group">
        <span>{{ prefix }}</span>
        <CoreLink :url="creator.url" class="no-underline group-hover:underline">
            <div class="flex items-center space-x-1">
                <img
                    v-if="creator.avatarUrl"
                    :src="creator.avatarUrl"
                    class="h-6 w-6 rounded-full object-cover m-0"
                    alt=""
                >
                <span>{{ creator.name }}</span>
            </div>
        </CoreLink>
    </p>
</template>

<script setup lang="ts">
import { silenced, urlClean } from '@noeldemartin/utils';

import Auth from '@/framework/core/facades/Auth';
import { computedAsync, requiredObjectProp, requiredStringProp } from '@/framework/utils/vue';

import type RecipesList from '@/models/RecipesList';

const { list } = defineProps({
    list: requiredObjectProp<RecipesList>(),
    prefix: requiredStringProp(),
});

const creator = $(computedAsync(async () => {
    if (!list?.creatorWebId) {
        return null;
    }

    const user = await silenced(Auth.getUserProfile(list.creatorWebId));

    return {
        name: user?.name ?? urlClean(user?.webId ?? list.creatorWebId, { protocol: false }),
        url: user?.webId ?? list.creatorWebId,
        avatarUrl: user?.avatarUrl,
    };
}));
</script>
