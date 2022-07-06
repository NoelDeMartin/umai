<template>
    <AppModal ref="$root" :title="title" :cancellable="!scanning">
        <WebImportScanning v-if="scanning" />
        <WebImportModalResults
            v-else-if="websiteMetadata && websiteRecipes"
            :metadata="websiteMetadata"
            :recipes="websiteRecipes"
        />
        <WebImportModalError
            v-else-if="error"
            :error="error"
        />
        <WebImportModalStart v-else ref="$start" />
    </AppModal>
</template>

<script setup lang="ts">
import { after } from '@noeldemartin/utils';
import { nextTick, onMounted, provide } from 'vue';

import { stringProp } from '@/framework/utils/vue';
import { translate } from '@/framework/utils/translate';

import { parseWebsiteMetadata, parseWebsiteRecipes } from '@/utils/web-parsing';
import type IAppModal from '@/components/modals/AppModal';
import type Recipe from '@/models/Recipe';
import type { WebsiteMetadata } from '@/utils/web-parsing';

import type IWebImportModal from './WebImportModal';
import type IWebImportModalStart from './WebImportModalStart';

const { url } = defineProps({
    url: stringProp(),
});

let scanning = $ref(false);
let error = $ref<Error | undefined>();
let websiteUrl = $ref<string | undefined>(url ?? undefined);
let websiteRecipes = $ref<Recipe[] | undefined>();
let websiteMetadata = $ref<WebsiteMetadata | undefined>();
const $root = $ref<IAppModal<void> | null>(null);
const $start = $ref<IWebImportModalStart | null>(null);
const title = $computed(() => {
    if (scanning) {
        return;
    }

    if (websiteRecipes) {
        return translate('webImport.success_title');
    }

    if (error) {
        return translate('webImport.error_title');
    }

    return translate('webImport.title');
});

onMounted(async () => {
    await nextTick();

    if (!url || !$start) {
        return;
    }

    $start.submit();
});

provide<IWebImportModal>('web-import-modal', {
    get websiteUrl() {
        return websiteUrl;
    },
    async scan(operation) {
        await after({ milliseconds: 200 });

        scanning = true;

        try {
            await operation;
        } finally {
            scanning = false;
        }
    },
    async parseWebsite(url, html) {
        [websiteMetadata, websiteRecipes] = await Promise.all([
            parseWebsiteMetadata(url, html),
            parseWebsiteRecipes(url, html),
        ]);
    },
    async retry(operation) {
        error = undefined;

        await operation();
    },
    failed(newWebsiteUrl, newError) {
        websiteUrl = newWebsiteUrl;
        error = newError;
    },
    close: () => $root?.close(),
});
</script>
