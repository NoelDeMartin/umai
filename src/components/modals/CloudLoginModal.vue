<template>
    <AppModal v-slot="{ close }" :title="$t('cloud.login.title')">
        <div v-if="$auth.previousSession?.loginUrl" class="flex flex-col">
            <div class="prose">
                <p v-safe-html="$t('cloud.login.info_reconnect', { url: $auth.previousSession?.loginUrl })" />
            </div>
            <BaseButton class="mt-4 bg-brand-solid-700 hover:bg-brand-solid-500" @click="$auth.reconnect()">
                <i-app-solid-emblem aria-hidden="true" class="w-6 h-6" />
                <span class="ml-2">{{ $t('cloud.login.reconnect') }}</span>
            </BaseButton>
            <BaseButton secondary class="mt-2" @click="$auth.logout()">
                <span>{{ $t('cloud.logout') }}</span>
                <i-heroicons-solid-logout class="ml-2 w-4 h-4" />
            </BaseButton>
        </div>
        <template v-else>
            <div class="prose">
                <p>{{ $t('cloud.login.info') }}</p>
                <p>
                    <small>
                        <a href="https://solidproject.org/" target="_blank">{{ $t('cloud.login.info_learnMore') }}</a>
                    </small>
                </p>
            </div>
            <form class="flex flex-col" @submit.prevent="submit(close)">
                <BaseInput
                    ref="input"
                    :form="form"
                    :label="$t('cloud.login.loginUrl')"
                    name="loginUrl"
                    class="mt-4 focus:!ring-brand-solid-700 focus:!border-brand-solid-500"
                    placeholder="e.g. https://alice.solidcommunity.net/profile/card#me"
                />
                <BaseButton type="submit" class="mt-4 w-full bg-brand-solid-700 hover:bg-brand-solid-500">
                    <i-app-solid-emblem aria-hidden="true" class="w-6 h-6" />
                    <span class="ml-2">{{ $t('cloud.login.submit') }}</span>
                </BaseButton>
                <BaseLink
                    v-if="!$auth.dismissed"
                    class="mt-1 text-sm text-brand-solid-700 hover:text-brand-solid-500"
                    @click="$auth.dismiss(), close()"
                >
                    {{ $t('cloud.login.dismiss') }}
                </BaseLink>
            </form>
        </template>
    </AppModal>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import Auth from '@/framework/core/facades/Auth';
import Form from '@/framework/forms/Form';
import { nextTicks } from '@/framework/utils/vue';

import type IBaseInput from '@/components/base/BaseInput';

const input = ref<IBaseInput>();
const form = new Form({
    loginUrl: 'required',
});

onMounted(async () => {
    await nextTicks(2);

    // TODO use initialFocus when available
    // See https://github.com/tailwindlabs/headlessui/issues/542
    input.value?.focus();
});

async function submit(close: Function) {
    if (!form.submit())
        return;

    if (!/^https?:\/\//.test(form.data<string>('loginUrl')))
        form.input('loginUrl')?.update('https://' + form.data<string>('loginUrl'));

    const loggedIn = await Auth.login(form.data<string>('loginUrl'));

    if (loggedIn)
        close();
}
</script>
