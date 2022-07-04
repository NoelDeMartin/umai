<template>
    <CoreForm
        class="flex flex-col w-full max-w-prose mx-auto justify-center items-center mt-16"
        :form="form"
        @submit="submit()"
    >
        <HomeHeading>
            {{ $t('home.createCookbook.title') }}
        </HomeHeading>
        <template v-if="!processing">
            <CoreMarkdown :text="$t('home.createCookbook.message')" class="w-full" />
            <CoreDetails
                class="w-full -ml-4 mt-2"
                :summary="$t('home.createCookbook.advancedOptions')"
                @open="alignInputs(), $name?.focus()"
            >
                <div class="space-y-3">
                    <label class="flex flex-row items-center w-full">
                        <span ref="$nameLabel" class="font-medium">
                            {{ $t('home.createCookbook.nameLabel') }}
                        </span>
                        <CoreInput ref="$name" name="name" class="ml-2 flex-grow" />
                    </label>
                    <label class="flex flex-row items-center w-full">
                        <span ref="$storageUrlLabel" class="font-medium">
                            {{ $t('home.createCookbook.storageUrlLabel') }}
                        </span>
                        <CoreInput name="storageUrl" class="ml-2 flex-grow" />
                    </label>
                    <CoreMarkdown :text="$t('home.createCookbook.urlPreview', {url})" class="text-sm" />
                </div>
            </CoreDetails>
            <div class="flex flex-row items-center self-end mt-4 space-x-3">
                <CoreLink
                    class="text-sm"
                    @click="
                        $ui.showMarkdown(
                            $t('home.createCookbook.help_detailsTitle'),
                            $t('home.createCookbook.help_detailsContent')
                        )
                    "
                >
                    {{ $t('home.createCookbook.help') }}
                </CoreLink>
                <CoreButton class="text-lg" type="submit">
                    {{ $t('home.createCookbook.submit') }}
                </CoreButton>
            </div>
        </template>
        <template v-else>
            <i-app-spinner class="h-8 w-8 animate-spin text-primary-700 mt-2" aria-hidden="true" />
            <CoreMarkdown
                :text="$t('home.createCookbook.processing', { url })"
                class="text-center text-lg text-gray-700 mt-4"
            />
        </template>
    </CoreForm>
</template>

<script setup lang="ts">
import { stringToSlug, urlResolveDirectory } from '@noeldemartin/utils';

import Auth from '@/framework/core/facades/Auth';
import Cloud from '@/framework/core/facades/Cloud';
import { FormInputType, reactiveForm } from '@/framework/forms';
import type { IFocusable } from '@/framework/components/headless';

import Cookbook from '@/services/facades/Cookbook';

let processing = $ref(false);
const form = reactiveForm({
    name: {
        type: FormInputType.String,
        rules: 'required',
        default: 'Cookbook',
    },
    storageUrl: {
        type: FormInputType.String,
        rules: 'required',
        default: Auth.user?.storageUrls[0],
    },
});
const $name = $ref<IFocusable | null>(null);
const $nameLabel = $ref<HTMLElement | null>(null);
const $storageUrlLabel = $ref<HTMLElement | null>(null);
const url = $computed(() => urlResolveDirectory(form.storageUrl, stringToSlug(form.name)));

async function submit() {
    try {
        processing = true;
        await Cookbook.createRemote(form.name, form.storageUrl);
        await Cloud.sync();
    } finally {
        processing = false;
    }
}

async function alignInputs() {
    const $spans = [$nameLabel, $storageUrlLabel].filter(($label): $label is HTMLElement => !!$label);
    const maxWidth = $spans.reduce((width, $label) => Math.max(width, $label.clientWidth), 0);

    for (const $span of $spans) {
        $span.style.width = `${maxWidth}px`;
    }
}
</script>
