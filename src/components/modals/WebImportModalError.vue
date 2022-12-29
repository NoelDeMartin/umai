<template>
    <CoreForm :form="form" class="flex flex-col mt-2" @submit="modal.retry(() => submit())">
        <CoreMarkdown
            v-if="tooManyRequestsProxyUrl"
            :text="$t('webImport.error_tooManyRequests', { proxyUrl: tooManyRequestsProxyUrl })"
            :actions="{ 'view-error-details': () => $errors.inspect(error) }"
        />
        <CoreMarkdown
            v-else
            :text="$t('webImport.error_info', { url: form.url })"
            :actions="{ 'view-error-details': () => $errors.inspect(error) }"
        />
        <WebImportModalAdvancedOptions :form="form" class="mt-4" />
        <CoreButton type="submit" class="py-2 font-medium text-md mt-4" alignment="center">
            {{ $t('webImport.error_submit') }}
        </CoreButton>
        <CoreMarkdown
            class="self-center text-sm mt-1"
            :text="$t('webImport.error_html', { url: form.url })"
            :actions="{ 'open-html-form': () => parseHTML() }"
        />
    </CoreForm>
</template>

<script setup lang="ts">
import UI from '@/framework/core/facades/UI';
import { injectOrFail, requiredObjectProp } from '@/framework/utils/vue';

import TooManyRequestsError from '@/errors/TooManyRequestsError';
import WebImportHtmlModal from '@/components/modals/WebImportHtmlModal.vue';
import type { WebImportHtmlModalComponent } from '@/components/modals/WebImportHtmlModal';

import { useUrlForm } from './WebImportModal';
import type IWebImportModal from './WebImportModal';

const { error } = defineProps({
    error: requiredObjectProp<Error>(),
});
const modal = injectOrFail<IWebImportModal>(
    'web-import-modal',
    '<WebImportModalError> must be a child of a <WebImportModal>',
);
const { form, submit } = useUrlForm(modal);
const tooManyRequestsProxyUrl = $computed(() => {
    if (!(error instanceof TooManyRequestsError)) {
        return;
    }

    return error.proxyUrl;
});

async function parseHTML() {
    const htmlModal = await UI.openModal<WebImportHtmlModalComponent>(
        WebImportHtmlModal,
        { url: form.url },
    );
    const result = await htmlModal.beforeClose;

    if (!result) {
        await htmlModal.afterClose;

        modal.close();

        return;
    }

    await modal.retry(() => modal.parseWebsite(form.url, result.html));
}
</script>
