<template>
    <AppModal v-slot="{ close }" :title="$t('menu.logIn')">
        <CoreMarkdown :text="$t('home.onboarding.loginWithSolid_info')" class="max-w-md" />
        <CoreForm
            v-if="!$auth.isLoggedIn()"
            :form="form"
            @submit="submit(close)"
        >
            <CoreInputSubmit
                class="mt-4"
                name="url"
                color="brand-solid"
                :label="$t('home.onboarding.loginWithSolid_label')"
                :placeholder="$t('home.onboarding.loginWithSolid_placeholder')"
            >
                <i-app-solid-emblem class="h-6 w-6 text-brand-solid-500" aria-hidden="true" />
                <span class="ml-1">{{ $t('home.onboarding.loginWithSolid_submit') }}</span>
            </CoreInputSubmit>
        </CoreForm>
    </AppModal>
</template>

<script setup lang="ts">
import Auth from '@/framework/core/facades/Auth';
import { FormInputType, reactiveForm } from '@/framework/forms';

const form = reactiveForm({
    url: {
        type: FormInputType.String,
        default: 'https://',
        rules: 'required',
    },
});

async function submit(close: Function) {
    if (!/^https?:\/\//.test(form.url)) {
        form.url = 'https://' + form.url;
    }
    const loggedIn = await Auth.login(form.url);

    if (loggedIn) {
        close();
    }
}
</script>
