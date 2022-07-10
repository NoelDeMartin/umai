<template>
    <CoreButton
        v-if="!$auth.loggedIn"
        clear
        class="text-sm"
        @click="$ui.openModal(CloudStatusModal)"
    >
        {{ $t('recipes.accessControl.disconnected') }}
    </CoreButton>
    <CoreButton
        v-else-if="error"
        clear
        class="flex items-center space-x-2 text-red-500"
        @click="$errors.inspect(error)"
    >
        <i-zondicons-exclamation-outline class="w-4 h-4" aria-hidden="true" />
        <span class="text-sm">{{ $t('recipes.accessControl.error') }}</span>
    </CoreButton>
    <span v-else-if="!profile" class="flex items-center space-x-2 text-gray-600">
        <i-app-spinner class="animate-spin w-4 h-4" aria-hidden="true" />
        <span class="text-sm">{{ $t('recipes.accessControl.loading') }}</span>
    </span>
    <span v-else-if="updatingPermissions" class="flex items-center space-x-2 text-gray-600">
        <i-app-spinner class="animate-spin w-4 h-4" aria-hidden="true" />
        <span class="text-sm">{{ $t('recipes.accessControl.updating') }}</span>
    </span>
    <Listbox
        v-else
        :model-value="profile"
        as="div"
        :disabled="!!error || !profile || updatingPermissions"
        @update:model-value="(newProfile: AccessControlProfile) => updatePermissions(newProfile)"
    >
        <ListboxLabel class="sr-only">
            {{ $t('recipes.accessControl.change_label_a11y') }}
        </ListboxLabel>
        <div class="relative">
            <ListboxButton
                ref="button"
                v-wobbly-border
                class="relative inline-flex items-center p-2 rounded-md text-sm font-medium focus:outline-none focus:z-10 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-brand-solid-500 hover:bg-gray-200"
                :aria-label="$t('recipes.accessControl.change_label_a11y', { current: profile.name })"
            >
                <component :is="profile.iconComponent" class="h-4 w-4" aria-hidden="true" />
                <p class="ml-2 text-sm font-medium">
                    {{ profile.name }}
                </p>
            </ListboxButton>

            <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
                <ListboxOptions
                    class="fixed z-10 mt-2 max-w-prose rounded-md shadow-lg overflow-hidden bg-white divide-y divide-gray-200 ring-1 ring-black ring-opacity-5 focus:outline-none"
                    :style="`top:${optionsPosition.top}px;right:${optionsPosition.right}px`"
                >
                    <ListboxOption
                        v-for="profileOption in profiles"
                        :key="profileOption.name"
                        v-slot="{ active, selected }"
                        as="template"
                        :value="profileOption"
                    >
                        <li
                            :class="[
                                active ? 'text-white bg-brand-solid-500' : 'text-gray-900',
                                'select-none relative p-4 text-sm flex items-center cursor-pointer'
                            ]"
                        >
                            <div class="flex flex-col">
                                <div class="flex justify-between">
                                    <p :class="[selected ? 'font-semibold' : 'font-normal', 'flex items-center']">
                                        <component :is="profileOption.iconComponent" :class="optionIconClasses(active, selected)" aria-hidden="true" />
                                        <span class="ml-2">{{ profileOption.name }}</span>
                                    </p>
                                </div>
                                <p :class="[active ? 'text-brand-solid-200' : 'text-gray-500', 'mt-2']">
                                    {{ profileOption.description }}
                                </p>
                            </div>
                            <div class="flex-grow" />
                            <span v-if="selected" :class="[active ? 'text-white' : 'text-brand-solid-500', 'ml-4']">
                                <i-zondicons-checkmark class="h-5 w-5" aria-hidden="true" />
                            </span>
                        </li>
                    </ListboxOption>
                </ListboxOptions>
            </transition>
        </div>
    </Listbox>
</template>

<script setup lang="ts">
import IconViewHide from '~icons/zondicons/view-hide';
import IconViewShow from '~icons/zondicons/view-show';
import { markRaw, onMounted, watchEffect } from 'vue';
import { SolidDocumentPermission } from 'soukai-solid';
import type { Component } from 'vue';

import Auth from '@/framework/core/facades/Auth';
import { requiredObjectProp } from '@/framework/utils/vue';
import { translate } from '@/framework/utils/translate';

import CloudStatusModal from '@/components/modals/CloudStatusModal.vue';
import type Recipe from '@/models/Recipe';

interface AccessControlProfile {
    name: string;
    description: string;
    iconComponent: Component;
    publicPermissions: SolidDocumentPermission[];
}

const { recipe } = defineProps({
    recipe: requiredObjectProp<Recipe>(),
});

const publicProfile: AccessControlProfile = markRaw({
    name: translate('recipes.accessControl.profile_public'),
    description: translate('recipes.accessControl.profile_publicDescription'),
    iconComponent: IconViewShow,
    publicPermissions: [SolidDocumentPermission.Read],
});
const privateProfile: AccessControlProfile = markRaw({
    name: translate('recipes.accessControl.profile_private'),
    description: translate('recipes.accessControl.profile_privateDescription'),
    iconComponent: IconViewHide,
    publicPermissions: [],
});
const profiles: AccessControlProfile[] = [publicProfile, privateProfile];

let error = $ref<Error | null>(null);
let updatingPermissions = $ref(false);
let optionsPosition = $ref({ top: 0, right: 0 });
let profile = $ref<AccessControlProfile | null>(null);
const button = $ref<{ el: HTMLButtonElement } | undefined>();

function optionIconClasses(active: boolean, selected: boolean): string {
    const conditionalClasses = () => {
        if (active)
            return 'text-white';

        if (selected)
            return 'text-gray-600';

        return 'text-gray-400';
    };

    return `h-4 w-4 ${conditionalClasses()}`;
}

async function updatePermissions(newProfile: AccessControlProfile) {
    if (newProfile === profile)
        return;

    updatingPermissions = true;

    try {
        await recipe.updatePublicPermissions(newProfile.publicPermissions);

        profile = newProfile;
    } catch (e) {
        error = e as Error;
    } finally {
        updatingPermissions = false;
    }
}

async function initializePermissionsProfile() {
    try {
        await recipe.fetchPublicPermissionsIfMissing();

        profile = recipe.isPublic ? publicProfile : privateProfile;
    } catch (e) {
        error = e as Error;
    }
}

function updateOptionsPosition(buttonElement: HTMLElement) {
    const buttonBoundingRect = buttonElement.getBoundingClientRect();

    optionsPosition = {
        top: buttonBoundingRect.bottom,
        right: window.innerWidth - buttonBoundingRect.right,
    };
}

watchEffect(() => button && updateOptionsPosition(button.el));
onMounted(async () => {
    if (!Auth.loggedIn) {
        return;
    }

    await initializePermissionsProfile();
});
</script>
