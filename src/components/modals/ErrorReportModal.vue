<template>
    <AppModal :padding="false">
        <div class="p-4">
            <div class="flex justify-between">
                <h2 class="font-medium text-lg">
                    {{ title }}
                </h2>
                <div v-if="details" class="flex flex-row-reverse space-x-reverse space-x-2">
                    <CoreButton
                        clear
                        class="group"
                        :title="$t('errors.reportToGithub')"
                        :aria-label="$t('errors.reportToGithub')"
                        :url="githubReportUrl"
                    >
                        <i-mdi-github class="w-6 h-6" aria-hidden="true" />
                        <span class="hidden group-hover:block group-hover:ml-2 group-focus:block group-focus:ml-2">{{ $t('errors.reportToGithub') }}</span>
                    </CoreButton>
                    <CoreButton
                        clear
                        class="group"
                        :title="$t('errors.copyToClipboard')"
                        :aria-label="$t('errors.copyToClipboard')"
                        @click="copyToClipboard"
                    >
                        <i-pepicons-duplicate class="w-6 h-6" aria-hidden="true" />
                        <span class="hidden group-hover:block group-hover:ml-2 group-focus:block group-focus:ml-2">{{ $t('errors.copyToClipboard') }}</span>
                    </CoreButton>
                    <CoreButton
                        clear
                        class="group"
                        :title="$t('errors.inspectInConsole')"
                        :aria-label="$t('errors.inspectInConsole')"
                        @click="inspectInConsole"
                    >
                        <i-ic-baseline-terminal class="w-6 h-6" aria-hidden="true" />
                        <span class="hidden group-hover:block group-hover:ml-2 group-focus:block group-focus:ml-2">{{ $t('errors.inspectInConsole') }}</span>
                    </CoreButton>
                </div>
            </div>
            <p v-if="description" class="mt-2">
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
import { stringExcerpt } from '@noeldemartin/utils';

import App from '@/framework/core/facades/App';
import UI from '@/framework/core/facades/UI';
import { translate } from '@/framework/utils/translate';
import { requiredObjectProp } from '@/framework/utils/vue';
import type { ErrorReport } from '@/framework/core/services/ErrorsService';

const { report } = defineProps({
    report: requiredObjectProp<ErrorReport>(),
});

const title = $computed(() => report.error?.name ?? report.title);
const description = $computed(() => report.error ? report.error.message : null);
const summary = $computed(() => description ? `${title}: ${description}` : title);
const details = $computed(() => report.error?.stack || null);
const githubReportUrl = $computed(() => {
    const issueBodyTemplate = translate('errors.githubIssueBody');
    const issueTitle = encodeURIComponent(summary);
    const issueBody = encodeURIComponent(
        issueBodyTemplate.replace(
            '%STACKTRACE%',
            stringExcerpt(
                details ?? 'Stack trace missing',
                1900 - issueBodyTemplate.length - issueTitle.length - App.sourceUrl.length,
            ).trim(),
        ),
    );

    return `${App.sourceUrl}/issues/new?title=${issueTitle}&body=${issueBody}`;
});

function inspectInConsole() {
    (window as { error?: Error }).error = report.error;

    UI.showSnackbar(translate('errors.addedToConsole'));
}

async function copyToClipboard() {
    await navigator.clipboard.writeText(`${summary}\n\n${details}`);

    UI.showSnackbar(translate('errors.copiedToClipboard'));
}
</script>
