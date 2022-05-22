<template>
    <AppModal>
        <template #title>
            <div class="flex justify-between">
                {{ $t('recipes.share') }}
                <RecipeAccessControl
                    v-if="$cookbook.isRemote"
                    :recipe="recipe"
                />
            </div>
        </template>

        <template #default="{ close }">
            <RecipeShareOptions v-model="shareOption" />
            <BaseClipboard
                class="mt-4 max-w-readable"
                :text="clipboardContent"
            />
            <p
                v-if="shareOption === 'umai' && recipe.isPrivate"
                class="mt-2 flex self-end text-red-500"
            >
                <i-zondicons-exclamation-outline
                    class="mt-1 mr-2 h-4 w-4 flex-shrink-0"
                />
                {{ $t('recipes.accessControl.warning') }}
            </p>
            <div class="mt-4 flex justify-end">
                <BaseButton
                    v-if="shareOption === 'jsonld'"
                    @click="recipe.download(), close()"
                >
                    <i-zondicons-download class="mr-2 h-4 w-4" />
                    {{ $t('recipes.download') }}
                </BaseButton>
                <BaseButton v-else @click="share(), close()">
                    {{ $t('recipes.share') }}
                </BaseButton>
            </div>
        </template>
    </AppModal>
</template>

<script setup lang="ts">
import {
    objectWithoutEmpty,
    stringExcerpt,
    urlRoot,
} from '@noeldemartin/utils';
import type { PropType } from 'vue';

import Router from '@/framework/core/facades/Router';

import Cookbook from '@/services/facades/Cookbook';
import { RecipeShareOption } from '@/components/recipe/RecipeShareOptions';
import type Recipe from '@/models/Recipe';

const { recipe } = defineProps({
    recipe: {
        type: Object as PropType<Recipe>,
        required: true,
    },
});

const clipboardContents: Record<RecipeShareOption, string> = {
    [RecipeShareOption.Umai]:
        urlRoot(location.href) +
        Router.resolve({
            name: 'viewer',
            query: { url: recipe.getDocumentUrl() },
        }).href,
    [RecipeShareOption.Solid]: recipe.url,
    [RecipeShareOption.JsonLD]: JSON.stringify(
        recipe.toExternalJsonLD(),
        null,
        2,
    ),
};
const shareOption = $ref<RecipeShareOption>(
    Cookbook.isRemote ? RecipeShareOption.Umai : RecipeShareOption.JsonLD,
);
const clipboardContent = $computed(
    () => (clipboardContents as Record<string, string>)[shareOption],
);

function share() {
    // TODO Implement fallback

    navigator.share(
        objectWithoutEmpty({
            title: recipe.name,
            text: recipe.description ? stringExcerpt(recipe.description) : null,
            url: clipboardContent,
        }),
    );
}
</script>
