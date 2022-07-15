<template>
    <div v-if="$auth.ongoing" class="flex items-center">
        <i-app-spinner class="h-4 w-4 animate-spin text-brand-solid-700" aria-hidden="true" />
        <CoreMarkdown
            :text="
                $auth.stale
                    ? $t('home.onboarding.loginWithSolid_stale')
                    : $t('home.onboarding.loginWithSolid_loading')
            "
            :actions="{
                reload: () => $app.reload(),
            }"
            class="ml-2 text-lg text-gray-700"
        />
    </div>
    <CoreForm
        v-else
        :form="form"
        class="flex flex-col items-center"
        @submit="submit()"
    >
        <CoreMarkdown :text="$t('home.onboarding.loginWithSolid_info')" class="max-w-md text-center" />
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
        <CoreLink class="mt-4 text-sm" @click="$emit('cancel')">
            {{ $t('home.onboarding.back') }}
        </CoreLink>
    </CoreForm>
</template>

<script setup lang="ts">
import Auth from '@/framework/core/facades/Auth';
import { FormInputType, reactiveForm } from '@/framework/forms';

defineEmits(['cancel']);

const form = reactiveForm({
    url: {
        type: FormInputType.String,
        default: 'https://',
        rules: 'required',
    },
});

async function submit() {
    if (!/^https?:\/\//.test(form.url)) {
        form.url = 'https://' + form.url;
    }

    await Auth.login(form.url);
}
</script>
