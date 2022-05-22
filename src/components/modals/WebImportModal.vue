<template>
    <AppModal v-slot="{ close }" :title="title">
        <div v-if="scanning" class="flex flex-col justify-center items-center p-4 space-y-4">
            <i-app-scanning class="w-12 h-12 text-primary-500" />
            <p class="text-xl text-gray-700">
                {{ $t('webImport.scanning') }}
            </p>
        </div>
        <CoreForm
            v-else-if="recipesForm && recipes && websiteMetadata"
            :form="recipesForm"
            class="flex flex-col"
            @submit="submitRecipes(close)"
        >
            <template v-if="recipes.length > 1">
                <BaseMarkdown v-if="recipes.length > 1" :text="$t('webImport.success_infoMultiple')" />

                <ul v-if="recipes.length > 1" class="mt-4 space-y-2">
                    <li class="flex items-center">
                        <BaseCheckbox
                            id="all-recipes"
                            class="w-6 h-6"
                            :checked="recipesForm.recipes.length === recipes.length"
                            @change="selectAllRecipes($event)"
                        />
                        <label class="ml-4 cursor-pointer" for="all-recipes">{{ $t('webImport.success_allRecipes') }}</label>
                    </li>
                    <li v-for="(recipe, index) of recipes" :key="index" class="flex items-center">
                        <BaseCheckbox
                            :id="`recipes-${index}`"
                            name="recipes"
                            :value="index"
                            class="w-6 h-6"
                        />
                        <label :for="`recipes-${index}`" class="mt-2 ml-4 w-full hover:cursor-pointer">
                            <RecipeListItem
                                :name="recipe.name"
                                :description="recipe.description"
                                :image-url="recipe.imageUrl"
                            />
                        </label>
                    </li>
                </ul>
            </template>

            <template v-else-if="recipes.length === 1">
                <BaseMarkdown :text="$t('webImport.success_infoSingle')" />
                <RecipeListItem
                    class="mt-4"
                    :name="recipes[0]?.name"
                    :description="recipes[0]?.description"
                    :image-url="recipes[0]?.imageUrl"
                />
            </template>

            <template v-else>
                <BaseMarkdown :text="$t('webImport.success_infoFallback')" />
                <RecipeListItem
                    class="mt-4"
                    :name="websiteMetadata.title"
                    :description="websiteMetadata.description"
                    :image-url="websiteMetadata.imageUrl"
                />
            </template>

            <BaseButton
                class="self-end mt-4"
                type="submit"
                :disabled="recipes.length > 0 && recipesForm.recipes.length === 0"
            >
                {{ recipes.length > 1 ? $t('webImport.success_importMultiple') : $t('webImport.success_importSingle') }}
            </BaseButton>
        </CoreForm>

        <template v-else-if="failure">
            <BaseMarkdown
                :text="$t('webImport.failure_info', { url: urlForm.url })"
                :actions="{
                    'view-error-details': () => $errors.inspect(failure),
                }"
            />

            <details open class="mt-4">
                <summary class="cursor-pointer">
                    {{ $t('webImport.failure_retry') }}
                </summary>

                <CoreForm :form="urlForm" class="flex flex-col mt-2 space-y-2" @submit="scanWebsite(submitRetry())">
                    <BaseMarkdown :text="$t('webImport.failure_retry_info')" />
                    <div class="flex items-center">
                        <BaseCheckbox id="use-proxy" name="useProxy" />
                        <label for="use-proxy" class="ml-2 cursor-pointer">
                            {{ $t('webImport.failure_retry_useProxy') }}
                            <BaseFluidInput
                                ref="proxyUrlInput"
                                name="proxyUrl"
                                placeholder="https://"
                                :disabled="!urlForm.useProxy"
                                inline
                                class="ml-1"
                                @click="afterAnimationFrame().then(proxyUrlInput?.focus)"
                            />
                        </label>
                    </div>
                    <BaseButton type="submit" class="!mt-4">
                        {{ $t('webImport.failure_retry_submit') }}
                    </BaseButton>
                </CoreForm>
            </details>

            <details class="mt-4">
                <summary class="cursor-pointer">
                    {{ $t('webImport.failure_html') }}
                </summary>

                <CoreForm class="flex flex-col mt-2 space-y-2" :form="htmlForm" @submit="scanWebsite(submitHtml())">
                    <BaseMarkdown :text="$t('webImport.failure_html_info')" />
                    <div class="relative p-2 bg-gray-200 rounded">
                        <pre class="flex items-center text-gray-700 whitespace-pre-wrap min-h-clickable align-center">view-source:{{ urlForm.url }}</pre>
                        <button
                            type="button"
                            :aria-label="$t('webImport.failure_html_copyToClipboard')"
                            class="flex absolute top-2 right-2 justify-center items-center bg-white rounded w-clickable h-clickable hover:bg-gray-100"
                            @click="copySourceUrlToClipboard()"
                        >
                            <i-zondicons-copy class="w-4 h-4" />
                        </button>
                    </div>
                    <BaseTextArea name="html" :label="$t('webImport.failure_html_label')" :placeholder="$t('webImport.failure_html_placeholder')" />
                    <BaseButton type="submit" class="!mt-4">
                        {{ $t('webImport.failure_html_submit') }}
                    </BaseButton>
                </CoreForm>
            </details>
        </template>

        <CoreForm
            v-else
            :form="urlForm"
            class="flex flex-col"
            @submit="scanWebsite(submitUrl())"
        >
            <BaseMarkdown :text="$t('webImport.info')" />
            <BaseInput
                name="url"
                :label="$t('webImport.url_placeholder')"
                :placeholder="$t('webImport.url_placeholder')"
                class="mt-2"
            />
            <BaseButton type="submit" class="mt-2">
                {{ $t('webImport.submit') }}
            </BaseButton>
        </CoreForm>
    </AppModal>
</template>

<script setup lang="ts">
import { after, afterAnimationFrame } from '@noeldemartin/utils';

import Cloud from '@/framework/core/facades/Cloud';
import I18n from '@/framework/core/facades/I18n';
import Network from '@/framework/core/facades/Network';
import Router from '@/framework/core/facades/Router';
import UI from '@/framework/core/facades/UI';
import { FormInputType, reactiveForm } from '@/framework/forms';
import type { ModalCloseCallback } from '@/framework/core/services/UIService';

import Config from '@/services/facades/Config';
import ConfigureProxyModal from '@/components/modals/ConfigureProxyModal.vue';
import Recipe from '@/models/Recipe';
import { parseWebsiteMetadata, parseWebsiteRecipes } from '@/utils/web-parsing';
import type IBaseFluidInput from '@/components/base/BaseFluidInput';
import type { WebsiteMetadata } from '@/utils/web-parsing';

let scanning = $ref(false);
let failure = $ref<Error | undefined>();
let recipes = $ref<Recipe[] | undefined>();
let websiteMetadata = $ref<WebsiteMetadata | undefined>();
const proxyUrlInput = $ref<IBaseFluidInput>();
const urlForm = reactiveForm({
    url: {
        type: FormInputType.String,
        rules: 'required',
    },
    useProxy: {
        type: FormInputType.Boolean,
        default: !!Config.proxyUrl,
    },
    proxyUrl: {
        type: FormInputType.String,
        default: Config.proxyUrl || '',
    },
});
const htmlForm = reactiveForm({
    html: {
        type: FormInputType.String,
        rules: 'required',
    },
});
const title = $computed(() => {
    if (scanning) return;
    if (recipes) return I18n.translate('webImport.success_title');
    if (failure) return I18n.translate('webImport.failure_title');

    return I18n.translate('webImport.title');
});
const recipesForm = $computed(
    () => recipes && reactiveForm({
        recipes: {
            type: FormInputType.Number,
            multi: true,
            default: recipes?.map((_, index) => index),
        },
    }),
);

async function scanWebsite(operation: Promise<void>): Promise<void> {
    await after({ milliseconds: 200 });

    scanning = true;

    try {
        await operation;
    } finally {
        scanning = false;
    }
}

async function submitUrl() {
    if (Config.proxyUrl === null) {
        const modal = await UI.openModal(ConfigureProxyModal);

        await modal.afterClose;

        urlForm.useProxy = !!Config.proxyUrl;
        urlForm.proxyUrl = Config.proxyUrl || '';
    }

    try {
        const url = urlForm.url;
        const proxyUrl = urlForm.useProxy ? urlForm.proxyUrl : false;
        const response = proxyUrl
            ? await fetch(proxyUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            })
            : await fetch(url);

        const text = await response.text();

        if (Math.floor(response.status / 100) !== 2)
            throw new Error(`Got unexpected response code: ${response.status}\n\n${text}`);

        await parseWebsite(url, text);
    } catch (error) {
        failure = error as Error;
    }
}

async function submitRetry() {
    failure = undefined;

    await submitUrl();
}

async function submitHtml() {
    failure = undefined;

    await parseWebsite(urlForm.url, htmlForm.html);
}

async function submitRecipes(close: ModalCloseCallback<void>): Promise<void> {
    close();

    const selectedRecipes =
        recipes?.length === 0
            ? [
                new Recipe({
                    name: websiteMetadata?.title,
                    description: websiteMetadata?.description,
                    imageUrl: websiteMetadata?.imageUrl,
                    externalUrls: [urlForm.url],
                }),
            ]
            : recipesForm?.recipes.map(index => recipes?.[index]) as Recipe[];

    await Promise.all(selectedRecipes.map(recipe => recipe.save()));

    selectedRecipes.length === 1 && await Router.push({
        name: 'recipes.show',
        params: { recipe: selectedRecipes[0]?.uuid },
    });

    UI.showSnackbar(I18n.translate('webImport.done', selectedRecipes.length));

    Network.online && Cloud.sync();
}

async function copySourceUrlToClipboard() {
    await navigator.clipboard.writeText(`view-source:${urlForm.url}`);

    UI.showSnackbar(I18n.translate('webImport.failure_html_copiedToClipboard'));
}

async function parseWebsite(url: string, html: string): Promise<void> {
    [recipes, websiteMetadata] = await Promise.all([
        parseWebsiteRecipes(url, html),
        parseWebsiteMetadata(url, html),
    ]);
}

function selectAllRecipes({ target }: Event) {
    if (!recipesForm || !recipes)
        return;

    const checked = (target as HTMLInputElement)?.matches(':checked');

    recipesForm.recipes = checked ? recipes.map((_, index) => index) : [];
}
</script>
