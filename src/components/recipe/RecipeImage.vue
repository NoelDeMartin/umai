<template>
    <div :class="`flex justify-center items-center bg-gray-200 ${extraClasses}`">
        <i-zondicons-photo class="w-full h-2/5 opacity-25" />
        <img v-if="sourceUrl" :src="sourceUrl" class="absolute inset-0 object-cover w-full h-full">
    </div>
</template>

<script setup lang="ts">
import { urlRoot } from '@noeldemartin/utils';
import { watchEffect } from 'vue';
import type { PropType } from 'vue';

import Auth from '@/framework/core/facades/Auth';

import Cookbook from '@/services/facades/Cookbook';
import Files from '@/framework/core/facades/Files';
import Cache from '@/framework/core/facades/Cache';

const { class: classProp, url } = defineProps({
    url: {
        type: String as PropType<string | null>,
        default: null,
    },
    class: {
        type: String,
        default: '',
    },
});

let sourceUrl = $ref<string | undefined>();
const extraClasses = $computed(() => classProp.includes('absolute') ? classProp : `${classProp} relative`);

async function resolveSourceUrl(url: string): Promise<string | undefined> {
    const cookbookDomain = urlRoot(Cookbook.remoteCookbookUrl ?? Cookbook.localCookbookUrl);
    const getExternalImageUrl = () => {
        if (url.startsWith(cookbookDomain) || url.startsWith('tmp://'))
            return;

        return url;
    };
    const getLocalImageUrl = async () => {
        const file = await Files.get(url);

        if (!file)
            return;

        return URL.createObjectURL(file.blob);
    };
    const fetchImageUrl = async () => {
        const cachedResponse = await Cache.get(url) ?? await downloadImage();
        const blob = await cachedResponse?.blob();

        if (!blob)
            return;

        return URL.createObjectURL(blob);
    };
    const downloadImage = async () => {
        const response = await Auth.fetch(url);

        if (response.status !== 200)
            return;

        await Cache.store(url, response);

        return Cache.get(url);
    };

    return getExternalImageUrl()
        ?? await getLocalImageUrl()
        ?? await fetchImageUrl();
}

watchEffect(async () => (sourceUrl = url ? await resolveSourceUrl(url) : undefined));
</script>
