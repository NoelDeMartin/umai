<template>
    <BaseHeading id="home-title">
        {{ $t('home.createCookbook.title') }}
    </BaseHeading>
    <BaseForm class="flex flex-col space-y-2" :form="form" @submit="submit()">
        <p class="prose">
            {{ $t('home.createCookbook.message') }}
        </p>
        <BaseInput :label="$t('home.createCookbook.nameLabel')" name="name" />
        <BaseInput
            :label="$t('home.createCookbook.storageUrlLabel')"
            name="storageUrl"
        />
        <span
            v-safe-html="
                $t('home.createCookbook.info', { url: `<pre>${url}</pre>` })
            "
            class="text-sm"
        />
        <BaseButton type="submit">
            {{ $t('home.createCookbook.submit') }}
        </BaseButton>
    </BaseForm>
</template>

<script setup lang="ts">
import { stringToSlug, urlResolveDirectory } from '@noeldemartin/utils';

import Auth from '@/framework/core/facades/Auth';
import { FormInputType, reactiveForm } from '@/framework/forms';

import Cloud from '@/framework/core/facades/Cloud';
import Cookbook from '@/services/facades/Cookbook';

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

const url = $computed(() =>
    urlResolveDirectory(form.storageUrl, stringToSlug(form.name)));

async function submit() {
    await Cookbook.createRemote(form.name, form.storageUrl);
    await Cloud.sync();
}
</script>
