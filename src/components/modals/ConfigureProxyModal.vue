<template>
    <AppModal v-slot="{ close }" :title="$t('proxyConfig.title')" :cancellable="false">
        <CoreMarkdown :text="$t('proxyConfig.info', { url: `${$app.sourceUrl}/blob/main/docs/using-a-proxy.md` })" />
        <CoreForm class="mt-4" :form="form" @submit="submit(close)">
            <CoreDetails :summary="$t('proxyConfig.advancedOptions')">
                <label class="flex items-center">
                    <span>{{ $t('proxyConfig.proxyUrl') }}</span>
                    <CoreFluidInput class="ml-2" placeholder="https://..." name="proxyUrl" />
                </label>
            </CoreDetails>

            <div class="flex justify-end">
                <CoreLink @click="reject(close)">
                    {{ $t('proxyConfig.reject') }}
                </CoreLink>
                <CoreButton class="ml-2" type="submit">
                    {{ $t('proxyConfig.accept') }}
                </CoreButton>
            </div>
        </CoreForm>
    </AppModal>
</template>

<script setup lang="ts">
import App from '@/framework/core/facades/App';
import { FormInputType, reactiveForm } from '@/framework/forms';

import Config from '@/services/facades/Config';

const form = reactiveForm({
    proxyUrl: {
        type: FormInputType.String,
        rules: 'required',
        default: App.env('DEFAULT_PROXY_URL'),
    },
});

function reject(close: Function) {
    Config.proxyUrl = false;

    close();
}

function submit(close: Function) {
    Config.proxyUrl = form.proxyUrl;

    close();
}
</script>
