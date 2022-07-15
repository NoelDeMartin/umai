<template>
    <CoreForm
        :form="form"
        class="flex flex-col"
        @submit="submit()"
    >
        <CoreMarkdown :text="$t('webImport.info')" />
        <WebImportModalAdvancedOptions :form="form" class="mt-4" />
        <CoreInputSubmit
            name="url"
            :label="$t('webImport.url_label')"
            :placeholder="$t('webImport.url_placeholder')"
            class="mt-2 px-2 py-4"
        >
            {{ $t('webImport.submit') }}
        </CoreInputSubmit>
    </CoreForm>
</template>

<script setup lang="ts">
import { injectOrFail } from '@/framework/utils/vue';

import { useUrlForm } from './WebImportModal';
import type IWebImportModal from './WebImportModal';
import type IWebImportModalStart from './WebImportModalStart';

const modal = injectOrFail<IWebImportModal>(
    'web-import-modal',
    '<WebImportModalStart> must be a child of a <WebImportModal>',
);
const { form, submit } = useUrlForm(modal);

defineExpose<IWebImportModalStart>({ submit });
</script>
