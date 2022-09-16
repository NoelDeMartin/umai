<template>
    <div
        :class="`flex justify-center items-center bg-gray-200 ${extraClasses}`"
        :style="hue ? `background: hsl(${hue} 40% 80%)` : ''"
    >
        <i-mdi-image-remove v-if="failed" class="w-full h-2/5 opacity-25" aria-hidden="true" />
        <i-mdi-image v-else class="w-full h-2/5 opacity-25" aria-hidden="true" />
        <img
            v-if="sourceUrl && !failed"
            :src="sourceUrl"
            class="absolute inset-0 object-cover w-full h-full"
            @error="failed = true"
        >
    </div>
</template>

<script setup lang="ts">
import { range, urlRoot } from '@noeldemartin/utils';
import { watch, watchEffect } from 'vue';

import Auth from '@/framework/core/facades/Auth';
import { objectProp, stringProp } from '@/framework/utils/vue';

import Cookbook from '@/services/facades/Cookbook';
import Files from '@/framework/core/facades/Files';
import Cache from '@/framework/core/facades/Cache';

import type Recipe from '@/models/Recipe';

const { class: classProp, recipe, url } = defineProps({
    class: stringProp(''),
    recipe: objectProp<Recipe>(),
    url: stringProp(),
});

let failed = $ref(false);
let sourceUrl = $ref<string | undefined>();
const imageUrl = $computed(() => url ?? recipe?.imageUrl);
const extraClasses = $computed(() => classProp.includes('absolute') ? classProp : `${classProp} relative`);
const hue = $computed(() => {
    if (!recipe) {
        return null;
    }

    return range(recipe.name.length).reduce((count, index) => count + recipe.name.charCodeAt(index), 0) % 255;
});

async function resolveSourceUrl(url: string): Promise<string | undefined> {
    const cookbookDomain = urlRoot(Cookbook.remoteCookbookUrl ?? Cookbook.localCookbookUrl);
    const getExternalImageUrl = () => {
        if (url.startsWith(cookbookDomain) || url.startsWith('tmp://')) {
            return null;
        }

        return url;
    };
    const getLocalImageUrl = async () => {
        const file = await Files.get(url);

        return file && URL.createObjectURL(file.blob);
    };
    const fetchImageUrl = async () => {
        const cachedResponse = await Cache.get(url) ?? await downloadImage();
        const blob = await cachedResponse?.blob();

        return blob && URL.createObjectURL(blob);
    };
    const downloadImage = async () => {
        try {
            const response = await Auth.fetch(url);

            if (response.status !== 200) {
                return null;
            }

            await Cache.store(url, response);

            return Cache.get(url);
        } catch (error) {
            return null;
        }
    };

    return getExternalImageUrl()
        ?? await getLocalImageUrl()
        ?? await fetchImageUrl();
}

watch($$(sourceUrl), () => failed = false);
watchEffect(async () => (sourceUrl = imageUrl ? await resolveSourceUrl(imageUrl) : undefined));
</script>
