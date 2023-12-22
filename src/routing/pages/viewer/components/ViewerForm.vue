<template>
    <CoreForm :form="form" class="flex max-w-full pt-edge" @submit="submit()">
        <div class="flex flex-col items-center justify-center max-w-prose px-edge mx-auto w-full">
            <div v-if="searching" class="flex flex-col justify-center items-center p-4 space-y-4">
                <i-app-scanning class="w-12 h-12 text-primary-500" />
                <p class="text-xl text-gray-700">
                    {{ $t('viewer.form.searching') }}
                </p>
            </div>
            <template v-else>
                <i-app-umai-xmas class="h-auto w-[250px] max-w-[60vw] fill-primary-500 flex-shrink-0" aria-hidden="true" />
                <h1 id="viewer-form-title" class="text-2xl font-medium mt-6">
                    {{ $t('viewer.form.title') }}
                </h1>
                <CoreMarkdown :text="$t('viewer.form.description')" class="mt-4 text-center" />
                <CoreInputSubmit
                    class="mt-4 w-full"
                    name="url"
                    :label="$t('viewer.form.urlLabel')"
                    :placeholder="$t('viewer.form.urlPlaceholder')"
                >
                    {{ $t('viewer.form.submit') }}
                </CoreInputSubmit>
                <CoreMarkdown
                    v-if="notFound"
                    class="mt-2 text-center text-red-700 opacity-75 w-full"
                    :text="$t('viewer.form.notFound', { url: notFound })"
                />
            </template>
        </div>
    </CoreForm>
</template>

<script setup lang="ts">
import { getLocationQueryParameter } from '@noeldemartin/utils';
import { onMounted } from 'vue';

import Router from '@/framework/core/facades/Router';
import { FormInputType, reactiveForm } from '@/framework/forms';
import Viewer from '@/services/facades/Viewer';

let searching = $ref(false);
let notFound = $ref<string | null>(null);
const form = reactiveForm({
    url: {
        type: FormInputType.String,
        rules: 'required',
        default: getLocationQueryParameter('url'),
    },
});

async function findRecipes(): Promise<void> {
    searching = true;
    notFound = null;

    const found = await Viewer.search(form.url);

    notFound = found ? null : form.url;
    searching = false;
}

async function submit(): Promise<void> {
    await Router.push({ name: 'viewer', query: { url: form.url } });
    await findRecipes();
}

onMounted(() => form.url && findRecipes());
</script>
