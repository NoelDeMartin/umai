<template>
    <RadioGroup v-if="$cookbook.isRemote" v-model="selectedOption" class="flex items-center space-x-2">
        <RadioGroupLabel class="mr-2">
            {{ $t('recipes.shareWith') }}
        </RadioGroupLabel>
        <RadioGroupOption
            v-for="option of options"
            v-slot="{ checked }"
            :key="option.id"
            :value="option.id"
            :aria-label="option.name"
        >
            <div
                v-wobbly-border
                :class="[
                    checked ? 'bg-primary-200 px-4' : 'bg-gray-200 w-clickable',
                    'h-clickable flex justify-center items-center cursor-pointer'
                ]"
            >
                <component :is="option.iconComponent" class="w-4 h-4" />
                <span v-if="checked" class="ml-2">
                    {{ option.name }}
                </span>
            </div>
        </RadioGroupOption>
    </RadioGroup>
</template>

<script setup lang="ts">
import IconJsonLD from '~icons/file-icons/json-ld2';
import IconSolid from '~icons/app/solid-emblem';
import IconViewShow from '~icons/zondicons/view-show';
import type { Component } from 'vue';

import { requiredEnumProp } from '@/framework/utils/vue';
import { translate } from '@/framework/utils/translate';

import { RecipeShareOption } from './RecipeShareOptions';

interface RecipeSharingOptionData {
    name: string;
    iconComponent: Component;
}

const { modelValue } = defineProps({
    modelValue: requiredEnumProp(RecipeShareOption),
});
const emit = defineEmits(['update:modelValue']);

const optionsMap: Record<RecipeShareOption, RecipeSharingOptionData> = $computed(() => ({
    [RecipeShareOption.Umai]: {
        name: translate('recipes.share_umai'),
        iconComponent: IconViewShow,
    },
    [RecipeShareOption.Solid]: {
        name: translate('recipes.share_solid'),
        iconComponent: IconSolid,
    },
    [RecipeShareOption.JsonLD]: {
        name: translate('recipes.share_jsonld'),
        iconComponent: IconJsonLD,
    },
}));
const options = $computed(() => Object.entries(optionsMap).reduce(
    (options, [id, option]) => [...options, { id, ...option }],
    [] as (RecipeSharingOptionData & { id: string })[],
));
const selectedOption = $computed({
    get: () => modelValue,
    set: value => emit('update:modelValue', value),
});
</script>
