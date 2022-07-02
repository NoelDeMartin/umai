<template>
    <AppModal v-slot="{ close }" :title="$t('webImportHtml.title')">
        <CoreForm
            class="flex flex-col mt-2 space-y-2"
            :form="form"
            @submit="close(form.data())"
        >
            <CoreMarkdown :text="$t('webImportHtml.info')" />
            <CoreClipboard :text="`view-source:${url}`" class="max-w-prose" />
            <CoreTextArea
                name="html"
                :label="$t('webImportHtml.label')"
                :placeholder="$t('webImportHtml.placeholder')"
            />
            <CoreButton
                type="submit"
                class="py-2 font-medium text-md mt-4"
                alignment="center"
            >
                {{ $t('webImportHtml.submit') }}
            </CoreButton>
        </CoreForm>
    </AppModal>
</template>

<script setup lang="ts">
import { FormInputType, reactiveForm } from '@/framework/forms';
import { requiredStringProp } from '@/framework/utils/vue';

defineProps({
    url: requiredStringProp(),
});

const form = reactiveForm({
    html: {
        type: FormInputType.String,
        rules: 'required',
    },
});
</script>
