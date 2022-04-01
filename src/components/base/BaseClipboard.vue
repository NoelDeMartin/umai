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
            :aria-label="copyLabel"
            class="flex opacity-75 absolute top-2 right-2 justify-center items-center bg-white rounded w-clickable h-clickable hover:bg-gray-100 hover:opacity-100"
            @click="copyToClipboard()"
        >
            <i-zondicons-copy class="w-4 h-4" />
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
