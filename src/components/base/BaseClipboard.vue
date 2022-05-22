<template>
    <div class="relative rounded bg-gray-200">
        <div class="overflow-auto" style="max-height: 250px">
            <pre
                class="align-center box-content flex min-h-clickable items-center p-2 text-gray-700"
                v-text="text"
            />
        </div>
        <button
            type="button"
            :aria-label="copyLabel"
            class="absolute top-2 right-2 flex h-clickable w-clickable items-center justify-center rounded bg-white opacity-75 hover:bg-gray-100 hover:opacity-100"
            @click="copyToClipboard()"
        >
            <i-zondicons-copy class="h-4 w-4" />
        </button>
    </div>
</template>

<script setup lang="ts">
import I18n from '@/framework/core/facades/I18n';
import UI from '@/framework/core/facades/UI';

const { text, successMessage } = defineProps({
    text: {
        type: String,
        required: true,
    },
    copyLabel: {
        type: String,
        default: () => I18n.translate('ui.copyToClipboard'),
    },
    successMessage: {
        type: String,
        default: () => I18n.translate('ui.copiedToClipboard'),
    },
});

async function copyToClipboard() {
    await navigator.clipboard.writeText(text);

    UI.showSnackbar(successMessage);
}
</script>
