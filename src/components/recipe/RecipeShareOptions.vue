<template>
    <RadioGroup
        v-model="selectedOption"
        class="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0 md:items-center"
    >
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
                    checked ? 'bg-primary-200 px-4' : 'bg-gray-200 md:w-clickable',
                    'h-clickable flex justify-center items-center cursor-pointer'
                ]"
            >
                <component :is="option.iconComponent" class="w-4 h-4" />
                <span
                    class="ml-2"
                    :class="{ 'md:hidden': !checked }"
                >
                    {{ option.name }}
                </span>
            </div>
        </RadioGroupOption>
    </RadioGroup>
</template>

<script setup lang="ts">
import IconJsonLD from '~icons/file-icons/json-ld2';
import IconPrint from '~icons/pepicons/printer';
import IconSolid from '~icons/app/solid-emblem';
import IconViewShow from '~icons/zondicons/view-show';
import type { Component } from 'vue';

import { requiredEnumProp } from '@/framework/utils/vue';
import { translate } from '@/framework/utils/translate';

import Cookbook from '@/services/facades/Cookbook';

import { RecipeShareOption } from './RecipeShareOptions';

interface RecipeSharingOptionData {
    name: string;
    onlyRemote: boolean;
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
        onlyRemote: true,
    },
    [RecipeShareOption.Solid]: {
        name: translate('recipes.share_solid'),
        iconComponent: IconSolid,
        onlyRemote: true,
    },
    [RecipeShareOption.JsonLD]: {
        name: translate('recipes.share_jsonld'),
        iconComponent: IconJsonLD,
        onlyRemote: false,
    },
    [RecipeShareOption.Print]: {
        name: translate('recipes.share_print'),
        iconComponent: IconPrint,
        onlyRemote: false,
    },
}));
const options = $computed(() => Object.entries(optionsMap).reduce(
    (options, [id, option]) => {
        if (!option.onlyRemote || Cookbook.isRemote) {
            options.push({ id, ...option });
        }

        return options;
    },
    [] as (RecipeSharingOptionData & { id: string })[],
));
const selectedOption = $computed({
    get: () => modelValue,
    set: value => emit('update:modelValue', value),
});
</script>
