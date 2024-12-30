<template>
    <KitchenPage :title="title">
        <CoreMarkdown v-if="text" :text="text" class="text-gray-700 mt-2" />
        <CoreMarkdown v-else :text="$t('kitchen.instructions.empty')" class="text-gray-700 mt-2" />

        <div class="flex w-full justify-end space-x-2 mt-3">
            <CoreButton v-if="position === 1" route="kitchen.ingredients" :route-params="{ recipe: recipe.slug }">
                <i-pepicons-arrow-left class="w-4 h-4" aria-hidden="true" />
                <span class="ml-1">{{ $t('kitchen.previous') }}</span>
            </CoreButton>
            <CoreButton v-else route="kitchen.instructions" :route-params="{ recipe: recipe.slug, step: position - 1 }">
                <i-pepicons-arrow-left class="w-4 h-4" aria-hidden="true" />
                <span class="ml-1">{{ $t('kitchen.previous') }}</span>
            </CoreButton>
            <CoreButton v-if="!text || position === recipe.instructions?.length" route="kitchen.done" :route-params="{ recipe: recipe.slug }">
                <span class="mr-1">{{ $t('kitchen.next') }}</span>
                <i-pepicons-arrow-right class="w-4 h-4" aria-hidden="true" />
            </CoreButton>
            <CoreButton v-else route="kitchen.instructions" :route-params="{ recipe: recipe.slug, step: position + 1 }">
                <span class="mr-1">{{ $t('kitchen.next') }}</span>
                <i-pepicons-arrow-right class="w-4 h-4" aria-hidden="true" />
            </CoreButton>
        </div>
    </KitchenPage>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { requiredObjectProp, requiredStringProp } from '@/framework/utils/vue';
import { translate } from '@/framework/utils/translate';

import type Recipe from '@/models/Recipe';

const props = defineProps({
    recipe: requiredObjectProp<Recipe>(),
    step: requiredStringProp(),
});

const position = computed(() => parseInt(props.step));
const text = computed(() => {
    return props.recipe.instructions?.find(instructionStep => instructionStep.position === position.value)?.text;
});

const title = computed(() => {
    if (props.recipe.instructions?.length === 1 || !text.value) {
        return translate('kitchen.instructions.emptyTitle');
    }

    return translate('kitchen.instructions.title', { step: props.step });
});
</script>
