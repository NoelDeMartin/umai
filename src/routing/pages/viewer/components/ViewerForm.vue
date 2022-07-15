<template>
    <CoreForm
        :form="form"
        class="flex flex-col items-center justify-center max-w-prose px-edge mx-auto"
        @submit="submit()"
    >
        <div v-if="searching" class="flex flex-col justify-center items-center p-4 space-y-4">
            <i-app-scanning class="w-12 h-12 text-primary-500" />
            <p class="text-xl text-gray-700">
                {{ $t('viewer.searching') }}
            </p>
        </div>

        <template v-else>
            <i-app-umai class="h-auto w-[250px] max-w-[60vw] fill-primary-500" aria-hidden="true" />

            <h1 id="viewer-form-title" class="text-2xl font-medium mt-6">
                {{ $t('viewer.title') }}
            </h1>

            <CoreMarkdown :text="$t('viewer.description')" class="mt-4 text-center" />
            <CoreInputSubmit
                class="mt-4 w-full"
                name="url"
                :label="$t('viewer.urlLabel')"
                :placeholder="$t('viewer.urlPlaceholder')"
            >
                {{ $t('viewer.submit') }}
            </CoreInputSubmit>
            <CoreMarkdown
                v-if="notFound"
                class="mt-2 text-center"
                :text="$t('viewer.notFound', { url: notFound })"
            />
        </template>
    </CoreForm>
</template>

<script setup lang="ts">
import { getLocationQueryParameter, updateLocationQueryParameters, urlRoute } from '@noeldemartin/utils';
import { onMounted } from 'vue';
import { NetworkError, SolidEngine } from 'soukai-solid';

import Auth from '@/framework/core/facades/Auth';
import Errors from '@/framework/core/facades/Errors';
import { FormInputType, reactiveForm } from '@/framework/forms';

import Recipe from '@/models/Recipe';

const emit = defineEmits(['foundRecipe']);

let searching = $ref(false);
let notFound = $ref<string | null>(null);
const form = reactiveForm({
    url: {
        type: FormInputType.String,
        rules: 'required',
        default: getLocationQueryParameter('url'),
    },
});
const engine = $computed(() => new SolidEngine(Auth.fetch));

async function findRecipe(): Promise<Recipe | null> {
    if (!form.url)
        return null;

    try {
        const recipe = await Recipe.withEngine(engine, async () => {
            const recipes = await Recipe.all({ $in: [urlRoute(form.url)] });

            return recipes[0] ?? null;
        });

        return recipe;
    } catch(error) {
        if (!(error instanceof NetworkError))
            Errors.report(error);

        return null;
    }
}

async function findRecipes(): Promise<void> {
    searching = true;
    notFound = null;

    const recipe = await findRecipe();

    if (recipe) {
        emit('foundRecipe', recipe);

        return;
    }

    notFound = form.url;
    searching = false;
}

async function submit(): Promise<void> {
    updateLocationQueryParameters({ url: form.url });

    await findRecipes();
}

onMounted(() => form.url && findRecipes());
</script>
