<template>
    <AppModal v-slot="{ close }" no-padding :cancellable="!!details">
        <div class="px-4 pt-1 pb-4">
            <div class="flex justify-between">
                <h2 class="font-medium text-lg flex items-center">
                    <CoreMarkdown :text="report.title" heading />
                    <template v-if="reports.length > 1">
                        ({{ activeReportIndex + 1 }}/{{ reports.length }})
                        <CoreButton
                            clear
                            :wobbly-border="{ topRight: false, bottomRight: false }"
                            :disabled="activeReportIndex === 0"
                            :title="$t('errors.previousReport')"
                            :aria-label="$t('errors.previousReport')"
                            @click="activeReportIndex--"
                        >
                            <i-pepicons-angle-left class="w-6 h-6" aria-hidden="true" />
                        </CoreButton>
                        <CoreButton
                            clear
                            :wobbly-border="{ topLeft: false, bottomLeft: false }"
                            :disabled="activeReportIndex === reports.length - 1"
                            :title="$t('errors.nextReport')"
                            :aria-label="$t('errors.nextReport')"
                            @click="activeReportIndex++"
                        >
                            <i-pepicons-angle-right class="w-6 h-6" aria-hidden="true" />
                        </CoreButton>
                    </template>
                </h2>
                <div v-if="details" class="flex flex-row-reverse space-x-reverse space-x-2 mr-10">
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
                        v-if="$errors.sentryConfigured && report.sentryId !== null"
                        clear
                        class="group"
                        :title="report.sentryId ? $t('errors.viewSentryId') : $t('errors.reportToSentry')"
                        :aria-label="report.sentryId ? $t('errors.viewSentryId') : $t('errors.reportToSentry')"
                        @click="() => report.sentryId ? viewSentryReport(report.sentryId) : reportToSentry()"
                    >
                        <i-zondicons-bug class="w-6 h-6" aria-hidden="true" />
                        <span class="hidden group-hover:block group-hover:ml-2 group-focus:block group-focus:ml-2">
                            {{ report.sentryId ? $t('errors.viewSentryId') : $t('errors.reportToSentry') }}
                        </span>
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
            <CoreMarkdown
                v-if="report.description"
                :text="report.description"
                class="mt-2"
            />
            <div v-if="!details" class="flex flex-row justify-end mt-4">
                <CoreButton color="danger" @click="close">
                    {{ $t('ui.error_accept') }}
                </CoreButton>
            </div>
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
import Errors from '@/framework/core/facades/Errors';
import UI from '@/framework/core/facades/UI';
import { translate } from '@/framework/utils/translate';
import { requiredArrayProp } from '@/framework/utils/vue';
import type { ErrorReport } from '@/framework/core/services/ErrorsService';

const { reports } = defineProps({
    reports: requiredArrayProp<ErrorReport>(),
});

const activeReportIndex = $ref(0);
const report = $computed(() => reports[activeReportIndex] as ErrorReport);
const summary = $computed(() => report.description ? `${report.title}: ${report.description}` : report.title);
const details = $computed(() => report.details);
const githubReportUrl = $computed(() => {
    const issueTitle = encodeURIComponent(summary);
    const issueBody = encodeURIComponent(
        [
            '[Please, explain here what you were trying to do when this error appeared]',
            '',
            'Error details:',
            '```',
            stringExcerpt(
                details ?? 'Details missing from report',
                1800 - issueTitle.length - App.sourceUrl.length,
            ).trim(),
            '```',
        ].join('\n'),
    );

    return `${App.sourceUrl}/issues/new?title=${issueTitle}&body=${issueBody}`;
});

function viewSentryReport(sentryId: string) {
    UI.showSnackbar(translate('errors.viewSentryIdSuccess', { sentryId }));
}

function reportToSentry() {
    const sentryId = report.sentryId = Errors.reportToSentry(report.error);

    sentryId
        ? UI.showSnackbar(translate('errors.reportToSentrySuccess', { sentryId }))
        : UI.showSnackbar(translate('errors.reportToSentryFailed'));
}

function inspectInConsole() {
    (window as { error?: unknown }).error = report.error;

    UI.showSnackbar(translate('errors.addedToConsole'));
}

async function copyToClipboard() {
    await navigator.clipboard.writeText(`${summary}\n\n${details}`);

    UI.showSnackbar(translate('errors.copiedToClipboard'));
}
</script>
