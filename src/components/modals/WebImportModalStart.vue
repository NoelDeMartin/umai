<template>
    <CoreForm
        :form="form"
        class="flex flex-col"
        @submit="submit()"
    >
        <CoreMarkdown :text="$t('webImport.info')" />
        <div class="flex mt-2 px-2 py-4">
            <CoreInput
                ref="$input"
                name="url"
                class="z-10 h-14 text-lg font-medium pl-8 flex-grow min-w-[300px]"
                :label="$t('webImport.url_label')"
                :show-errors="false"
                :placeholder="$t('webImport.url_placeholder')"
                :wobbly-border="{ topRight: false, bottomRight: false }"
            />
            <CoreButton
                type="submit"
                class="focus:z-20 px-6 text-lg font-medium"
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
import { onMounted } from 'vue';

import { injectOrFail } from '@/framework/utils/vue';
import type { IFocusable } from '@/framework/components/headless';

import { useUrlForm } from './WebImportModal';
import type IWebImportModal from './WebImportModal';

const modal = injectOrFail<IWebImportModal>(
    'web-import-modal',
    '<WebImportModalStart> must be a child of a <WebImportModal>',
);
const $input = $ref<IFocusable | null>(null);
const { form, submit } = useUrlForm(modal);

onMounted(() => $input?.focus());
</script>
