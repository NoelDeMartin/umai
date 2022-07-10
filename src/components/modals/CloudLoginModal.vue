<template>
    <AppModal v-slot="{ close }" :title="$t('cloud.login.title')" :cancellable="!$auth.ongoing">
        <div v-if="$auth.ongoing" class="flex items-center">
            <i-app-spinner class="h-4 w-4 animate-spin text-brand-solid-700" aria-hidden="true" />
            <CoreMarkdown
                :text="
                    $auth.stale
                        ? $t('cloud.login.stale')
                        : $t('cloud.login.loading')
                "
                :actions="{
                    reload: () => $app.reload(),
                }"
                class="ml-2 text-lg text-gray-700"
            />
        </div>
        <div v-else-if="$auth.hasLoggedIn" class="flex flex-col">
            <CoreMarkdown
                v-if="$auth.loginError"
                :text="$t('cloud.login.info_loginError', { url: $auth.previousSession?.loginUrl })"
                :actions="{
                    'view-error-details': () => $errors.inspect($auth.loginError),
                }"
            />
            <CoreMarkdown
                v-else
                :text="$t('cloud.login.info_reconnect', { url: $auth.previousSession?.loginUrl })"
            />
            <CloudConfiguration class="mt-4" />
            <div class="flex flex-row-reverse space-x-2 space-x-reverse mt-4">
                <CoreButton
                    v-initial-focus
                    secondary
                    color="brand-solid"
                    @click="$auth.reconnect()"
                >
                    <i-pepicons-refresh aria-hidden="true" class="h-6 w-6" />
                    <span class="ml-2">{{ $t('cloud.reconnect_now') }}</span>
                </CoreButton>
                <CoreButton
                    secondary
                    color="danger"
                    @click="$auth.logout(), close()"
                >
                    <i-pepicons-leave class="h-6 w-6" />
                    <span class="ml-2">{{ $t('cloud.logout') }}</span>
                </CoreButton>
            </div>
        </div>
        <CoreForm
            v-else
            class="flex flex-col"
            :form="form"
            @submit="submit(close)"
        >
            <CoreMarkdown :text="$t('cloud.login.info')" />
            <div class="mt-2 flex">
                <CoreInput
                    initial-focus
                    name="url"
                    class="min-w-[300px] w-full"
                    color="brand-solid"
                    :label="$t('cloud.login.url')"
                    :show-errors="false"
                    :placeholder="$t('cloud.login.url_placeholder')"
                    :wobbly-border="{ topRight: false, bottomRight: false }"
                />
                <CoreButton
                    type="submit"
                    color="brand-solid"
                    alignment="center"
                    class="flex-shrink-0 focus:z-20"
                    :wobbly-border="{ topLeft: false, bottomLeft: false }"
                >
                    <i-app-solid-emblem class="h-6 w-6 text-brand-solid-500" aria-hidden="true" />
                    <span class="ml-1">{{ $t('cloud.login.submit') }}</span>
                </CoreButton>
            </div>
            <CoreLink
                v-if="!$auth.dismissed"
                color="brand-solid"
                class="mt-2 text-sm"
                @click="$auth.dismiss(), close()"
            >
                {{ $t('cloud.login.dismiss') }}
            </CoreLink>
        </CoreForm>
    </AppModal>
</template>

<script setup lang="ts">
import Auth from '@/framework/core/facades/Auth';
import { FormInputType, reactiveForm } from '@/framework/forms';

const form = reactiveForm({
    url: {
        type: FormInputType.String,
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
