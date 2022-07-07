<template>
    <CoreForm
        :form="form"
        class="flex flex-col items-center justify-center"
        @submit="submit()"
    >
        <div v-if="searching" class="flex flex-col justify-center items-center p-4 space-y-4">
            <i-app-scanning class="w-12 h-12 text-primary-500" />
            <p class="text-xl text-gray-700">
                {{ $t('viewer.searching') }}
            </p>
        </div>

        <template v-else>
            <h1 id="viewer-form-title" class="text-xl font-semibold">
                {{ $t('viewer.title') }}
            </h1>

            <div class="prose">
                <p>
                    {{ $t('viewer.description') }}
                </p>
            </div>

            <div>
                <div class="mt-2 flex">
                    <CoreInput
                        initial-focus
                        name="url"
                        class="z-10 min-w-[300px]"
                        :label="$t('viewer.urlLabel')"
                        :show-errors="false"
                        :placeholder="$t('viewer.urlPlaceholder')"
                        :wobbly-border="{ topRight: false, bottomRight: false }"
                    />
                    <CoreButton
                        type="submit"
                        alignment="center"
                        class="focus:z-20"
                        :wobbly-border="{ topLeft: false, bottomLeft: false }"
                    >
                        <span class="ml-1">{{ $t('viewer.submit') }}</span>
                    </CoreButton>
                </div>
                <CoreFormErrors class="mt-2" />
            </div>

            <CoreMarkdown
                v-if="notFound"
                class="mt-2 text-center prose"
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
