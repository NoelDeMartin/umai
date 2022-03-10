<template>
    <div class="flex space-x-4">
        <SquareIconButton
            v-slot="{ className }"
            :label="$t('recipes.new.fromScratch')"
            route="recipes.create"
            @click="$emit('optionSelected')"
        >
            <i-zondicons-document :class="className" />
        </SquareIconButton>
        <SquareIconButton
            v-slot="{ className }"
            :label="$t('recipes.new.fromTheWeb')"
            @click="$ui.openModal(WebImportModal), $emit('optionSelected')"
        >
            <i-zondicons-globe :class="className" />
        </SquareIconButton>
        <SquareIconButton
            v-slot="{ className }"
            :label="$t('recipes.new.fromJsonLD')"
            @click="importFromJsonLD(), $emit('optionSelected')"
        >
            <i-zondicons-upload :class="className" />
        </SquareIconButton>
    </div>
</template>

<script setup lang="ts">
import { uploadFile } from '@noeldemartin/utils';

import Router from '@/framework/core/facades/Router';

import Recipe from '@/models/Recipe';
import WebImportModal from '@/components/modals/WebImportModal.vue';

defineEmits(['optionSelected']);

async function importFromJsonLD() {
    const jsonld = await uploadFile();

    if (!jsonld)
        return;

    const recipe = await Recipe.createFromJsonLD(JSON.parse(jsonld));

    Router.push({
        name: 'recipes.show',
        params: { recipe: recipe.uuid },
    });
}
</script>
