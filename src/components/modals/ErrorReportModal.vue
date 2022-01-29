<template>
    <AppModal no-padding>
        <div class="p-4">
            <div class="flex justify-between">
                <h2>{{ title }}</h2>
                <div v-if="details" class="flex flex-row space-x-2">
                    <button
                        type="button"
                        class="flex justify-center items-center rounded-full w-clickable h-clickable hover:bg-dark-overlay"
                        @click="inspectInConsole"
                    >
                        <i-ic-baseline-terminal class="w-4 h-4" aria-hidden="true" />
                        <span class="hidden">{{ $t('errors.inspectInConsole') }}</span>
                    </button>
                    <button
                        type="button"
                        class="flex justify-center items-center rounded-full w-clickable h-clickable hover:bg-dark-overlay"
                        @click="copyToClipboard"
                    >
                        <i-zondicons-copy class="w-4 h-4" aria-hidden="true" />
                        <span class="hidden">{{ $t('errors.copyToClipboard') }}</span>
                    </button>
                    <a
                        target="_blank"
                        :href="githubReportUrl"
                        class="flex justify-center items-center rounded-full w-clickable h-clickable hover:bg-dark-overlay"
                    >
                        <i-mdi-github class="w-4 h-4" aria-hidden="true" />
                        <span class="hidden">{{ $t('errors.reportToGithub') }}</span>
                    </a>
                </div>
            </div>
            <p v-if="description">
                {{ description }}
            </p>
        </div>
        <pre
            v-if="details"
            class="overflow-auto p-4 h-full text-xs text-red-900 bg-gray-200"
            v-text="details"
        />
    </AppModal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PropType } from 'vue';

import App from '@/framework/core/facades/App';
import I18n from '@/framework/core/facades/I18n';
import UI from '@/framework/core/facades/UI';
import type { ErrorReport } from '@/framework/core/services/ErrorsService';

const props = defineProps({
    report: {
        type: Object as PropType<ErrorReport>,
        required: true,
    },
});

const title = computed(() => props.report.error?.name ?? props.report.title);
const description = computed(() => props.report.error ? props.report.error.message : null);
const summary = computed(() => description.value ? `${title.value}: ${description.value}` : title.value);
const details = computed(() => props.report.error?.stack || null);
const githubReportUrl = computed(() => {
    const issueTitle = encodeURIComponent(summary.value);
    const issueBody = encodeURIComponent(
        I18n
            .translate('errors.githubIssueBody', { stackTrace: details.value }),
    );

    return `${App.sourceUrl}/issues/new?title=${issueTitle}&body=${issueBody}`;
});

function inspectInConsole() {
    (window as { error?: Error }).error = props.report.error;

    UI.showSnackbar(I18n.translate('errors.addedToConsole'));
}

async function copyToClipboard() {
    await navigator.clipboard.writeText(`${summary.value}\n\n${details.value}`);

    UI.showSnackbar(I18n.translate('errors.copiedToClipboard'));
}
</script>
