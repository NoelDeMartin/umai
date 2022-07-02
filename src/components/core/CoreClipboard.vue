<template>
    <div class="relative bg-gray-200 rounded">
        <div class="overflow-auto" style="max-height:250px">
            <pre
                class="flex p-2 items-center text-gray-700 box-content min-h-clickable align-center"
                v-text="text"
            />
        </div>
        <button
            type="button"
            :aria-label="copyLabel ?? $t('ui.copyToClipboard')"
            :title="copyLabel ?? $t('ui.copyToClipboard')"
            class="flex opacity-75 absolute top-2 right-2 justify-center items-center bg-white rounded w-clickable h-clickable hover:bg-gray-100 hover:opacity-100"
            @click="copyToClipboard()"
        >
            <i-pepicons-duplicate class="w-6 h-6" aria-hidden="true" />
        </button>
    </div>
</template>

<script setup lang="ts">
import UI from '@/framework/core/facades/UI';
import { requiredStringProp, stringProp } from '@/framework/utils/vue';
import { translate } from '@/framework/utils/translate';

const { text, successMessage } = defineProps({
    text: requiredStringProp(),
    copyLabel: stringProp(),
    successMessage: stringProp(),
});

async function copyToClipboard() {
    await navigator.clipboard.writeText(text);

    UI.showSnackbar(successMessage ?? translate('ui.copiedToClipboard'));
}
</script>
