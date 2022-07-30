<template>
    <main
        class="flex flex-col min-h-screen"
        :style="`margin-top: -${$ui.headerHeight}px`"
        aria-labelledby="#recipe-form-title"
    >
        <WebImportScanning v-if="scanning" />
        <RecipeForm
            v-else
            :recipe="recipe"
            @done="onCreated"
            @cancel="$router.back()"
        />
    </main>
</template>

<script setup lang="ts">
import { getLocationQueryParameter, hasLocationQueryParameter, urlParse } from '@noeldemartin/utils';
import { onMounted } from 'vue';

import App from '@/framework/core/facades/App';
import Cloud from '@/framework/core/facades/Cloud';
import Network from '@/framework/core/facades/Network';
import Router from '@/framework/core/facades/Router';
import UI from '@/framework/core/facades/UI';
import { translate } from '@/framework/utils/translate';

import Config from '@/services/facades/Config';
import Cookbook from '@/services/facades/Cookbook';
import Recipe from '@/models/Recipe';
import WebImportModal from '@/components/modals/WebImportModal.vue';
import { parseWebsiteMetadata, parseWebsiteRecipes } from '@/utils/web-parsing';

let recipe = $ref(Cookbook.getTmpRecipe(history.state.tmpRecipe));
let scanning = $ref(hasLocationQueryParameter('from'));

async function onCreated() {
    UI.scrollLayout({ top: 0 });
    Router.push({ name: 'home' });

    await (Network.online && Cloud.sync());
}

onMounted(async () => {
    const websiteUrl = getLocationQueryParameter('from');

    if (!websiteUrl) {
        scanning = false;

        return;
    }

    UI.hideHeader();

    try {
        const proxyUrl = Config.proxyUrl ?? App.env('DEFAULT_PROXY_URL');
        const response = proxyUrl
            ? await fetch(proxyUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: websiteUrl }),
            })
            : await fetch(websiteUrl);

        const html = await response.text();

        if (Math.floor(response.status / 100) !== 2) {
            throw new Error(`Got unexpected response code: ${response.status}\n\n${html}`);
        }

        const [websiteMetadata, websiteRecipes] = await Promise.all([
            parseWebsiteMetadata(websiteUrl, html),
            parseWebsiteRecipes(websiteUrl, html),
        ]);

        recipe = websiteRecipes[0] ?? new Recipe({
            name: websiteMetadata.title,
            description: websiteMetadata.description,
            imageUrl: websiteMetadata.imageUrl,
            externalUrls: [websiteMetadata.url],
        });
    } catch (error) {
        UI.showSnackbar(
            translate('recipes.createFromUrl_notFound', {
                domain: urlParse(websiteUrl)?.domain?.replace(/^www\./, ''),
            }),
            {
                actions: [{
                    text: translate('recipes.createFromUrl_retry'),
                    handler() {
                        UI.openModal(WebImportModal, { url: websiteUrl });
                    },
                }],
            },
        );
    } finally {
        UI.showHeader();
        scanning = false;
    }
});
</script>
