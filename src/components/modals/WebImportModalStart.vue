<template>
    <CoreForm
        :form="form"
        class="flex flex-col"
        @submit="submit()"
    >
        <CoreMarkdown :text="$t('webImport.info')" />
        <WebImportModalAdvancedOptions :form="form" class="mt-4" />
        <div class="flex mt-2 px-2 py-4">
            <CoreInput
                initial-focus
                name="url"
                class="z-10 h-12 text-md font-medium pl-6 flex-grow min-w-[300px]"
                :label="$t('webImport.url_label')"
                :show-errors="false"
                :placeholder="$t('webImport.url_placeholder')"
                :wobbly-border="{ topRight: false, bottomRight: false }"
            />
            <CoreButton
                type="submit"
                class="focus:z-20 px-6 text-md font-medium"
                alignment="center"
                :wobbly-border="{ topLeft: false, bottomLeft: false }"
            >
                {{ $t('webImport.submit') }}
            </CoreButton>
        </div>
        <CoreFormErrors class="mt-2" />
    </CoreForm>
</template>

<script setup lang="ts">
import { injectOrFail } from '@/framework/utils/vue';

import { useUrlForm } from './WebImportModal';
import type IWebImportModal from './WebImportModal';

const modal = injectOrFail<IWebImportModal>(
    'web-import-modal',
    '<WebImportModalStart> must be a child of a <WebImportModal>',
);
const { form, submit } = useUrlForm(modal);
</script>
