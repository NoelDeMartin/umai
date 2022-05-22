<template>
    <AppModal v-slot="{ close }" :title="$t('proxyConfig.title')">
        <BaseMarkdown
            :text="
                $t('proxyConfig.info', {
                    url: `${$app.sourceUrl}/blob/main/docs/using-a-proxy.md`,
                })
            "
        />

        <BaseForm class="mt-4" :form="form" @submit="submit(close)">
            <details>
                <summary class="cursor-pointer">
                    {{ $t('proxyConfig.advancedOptions') }}
                </summary>

                <label class="flex items-center">
                    <span>{{ $t('proxyConfig.proxyUrl') }}:</span>
                    <BaseFluidInput
                        class="ml-2"
                        placeholder="https://..."
                        name="proxyUrl"
                    />
                </label>
            </details>

            <div class="flex justify-end">
                <BaseLink @click="reject(close)">
                    {{ $t('proxyConfig.reject') }}
                </BaseLink>
                <BaseButton class="ml-2" type="submit">
                    {{ $t('proxyConfig.accept') }}
                </BaseButton>
            </div>
        </BaseForm>
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
