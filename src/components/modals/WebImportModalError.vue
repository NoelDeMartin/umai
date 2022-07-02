<template>
    <CoreMarkdown
        :text="$t('webImport.error_info', { url: urlForm.url })"
        :actions="{
            'view-error-details': () => $errors.inspect(error),
        }"
    />
    <CoreDetails :summary="$t('webImport.error_retry')" open class="mt-4">
        <CoreForm :form="urlForm" class="flex flex-col mt-2" @submit="modal.retry(() => submitUrl())">
            <CoreMarkdown :text="$t('webImport.error_retry_info')" />
            <div class="flex items-center mt-2">
                <BaseCheckbox id="use-proxy" name="useProxy" />
                <label
                    for="use-proxy"
                    class="ml-2 cursor-pointer flex"
                    :class="{ 'opacity-50': !urlForm.useProxy }"
                >
                    <span class="self-center">{{ $t('webImport.error_retry_useProxy') }}</span>
                    <CoreFluidInput
                        ref="$proxyUrlInput"
                        name="proxyUrl"
                        placeholder="https://"
                        inline
                        class="ml-1"
                        :class="{ 'pointer-events-none': !urlForm.useProxy }"
                        :disabled="!urlForm.useProxy"
                        @click="afterAnimationFrame().then(() => $proxyUrlInput?.focus())"
                    />
                </label>
            </div>
            <CoreButton type="submit" class="py-2 font-medium text-lg mt-4" alignment="center">
                {{ $t('webImport.error_retry_submit') }}
            </CoreButton>
        </CoreForm>
    </CoreDetails>
    <CoreDetails :summary="$t('webImport.error_html')" class="mt-4">
        <CoreForm
            class="flex flex-col mt-2 space-y-2"
            :form="htmlForm"
            @submit="modal.retry(() => modal.parseWebsite(urlForm.url, htmlForm.html))"
        >
            <CoreMarkdown :text="$t('webImport.error_html_info')" />
            <div class="relative p-2 bg-gray-200 rounded">
                <pre class="flex items-center text-gray-700 whitespace-pre-wrap min-h-clickable align-center">view-source:{{ urlForm.url }}</pre>
                <button
                    type="button"
                    :aria-label="$t('webImport.error_html_copyToClipboard')"
                    class="flex absolute top-2 right-2 justify-center items-center bg-white rounded w-clickable h-clickable hover:bg-gray-100"
                    @click="copySourceUrlToClipboard()"
                >
                    <i-zondicons-copy class="w-4 h-4" />
                </button>
            </div>
            <CoreTextArea name="html" :label="$t('webImport.error_html_label')" :placeholder="$t('webImport.error_html_placeholder')" />
            <CoreButton type="submit" class="py-2 font-medium text-lg mt-4" alignment="center">
                {{ $t('webImport.error_html_submit') }}
            </CoreButton>
        </CoreForm>
    </CoreDetails>
</template>

<script setup lang="ts">
import { afterAnimationFrame } from '@noeldemartin/utils';

import UI from '@/framework/core/facades/UI';
import { FormInputType, reactiveForm } from '@/framework/forms';
import { injectOrFail, requiredObjectProp } from '@/framework/utils/vue';
import { translate } from '@/framework/utils/translate';
import type { IFocusable } from '@/framework/components/headless';

import { useUrlForm } from './WebImportModal';
import type IWebImportModal from './WebImportModal';

defineProps({
    error: requiredObjectProp<Error>(),
});

const modal = injectOrFail<IWebImportModal>(
    'web-import-modal',
    '<WebImportModalError> must be a child of a <WebImportModal>',
);

const { form: urlForm, submit: submitUrl } = useUrlForm(modal);
const htmlForm = reactiveForm({
    html: {
        type: FormInputType.String,
        rules: 'required',
    },
});
const $proxyUrlInput = $ref<IFocusable | null>(null);

async function copySourceUrlToClipboard() {
    await navigator.clipboard.writeText(`view-source:${urlForm.url}`);

    UI.showSnackbar(translate('webImport.error_html_copiedToClipboard'));
}
</script>
