<template>
    <div v-if="$auth.ongoing" class="flex items-center">
        <i-app-spinner class="h-4 w-4 animate-spin text-brand-solid-700" aria-hidden="true" />
        <CoreMarkdown
            :text="
                $auth.stale
                    ? $t('home.onboarding.loginWithSolid_stale')
                    : $t('home.onboarding.loginWithSolid_loading')
            "
            :actions="{ reload }"
            class="ml-2 text-lg text-gray-700"
        />
    </div>
    <CoreForm
        v-else
        :form="form"
        class="flex flex-col items-center"
        @submit="$auth.login(form.url)"
    >
        <CoreMarkdown :text="$t('home.onboarding.loginWithSolid_info')" class="max-w-md text-center" />
        <div>
            <div class="mt-2 flex">
                <CoreInput
                    initial-focus
                    name="url"
                    class="z-10 min-w-[300px]"
                    color="brand-solid"
                    :label="$t('home.onboarding.loginWithSolid_label')"
                    :show-errors="false"
                    :placeholder="$t('home.onboarding.loginWithSolid_placeholder')"
                    :wobbly-border="{ topRight: false, bottomRight: false }"
                />
                <CoreButton
                    type="submit"
                    color="brand-solid"
                    alignment="center"
                    class="focus:z-20"
                    :wobbly-border="{ topLeft: false, bottomLeft: false }"
                >
                    <i-app-solid-emblem class="h-6 w-6 text-brand-solid-500" aria-hidden="true" />
                    <span class="ml-1">{{ $t('home.onboarding.loginWithSolid_submit') }}</span>
                </CoreButton>
            </div>
            <CoreFormErrors class="mt-2" />
        </div>
        <CoreLink class="mt-4 text-sm" @click="$emit('cancel')">
            {{ $t('home.onboarding.back') }}
        </CoreLink>
    </CoreForm>
</template>

<script setup lang="ts">
import { FormInputType, reactiveForm } from '@/framework/forms';

defineEmits(['cancel']);

const form = reactiveForm({
    url: {
        type: FormInputType.String,
        default: 'https://',
        rules: 'required',
    },
});

function reload() {
    location.reload();
}
</script>
