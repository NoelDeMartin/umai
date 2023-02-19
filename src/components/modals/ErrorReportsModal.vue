<template>
    <AppModal
        v-slot="{ close }"
        :title="$t('errors.logs')"
        no-padding
        header-border
    >
        <ol>
            <li
                v-for="(log, index) in $errors.logs"
                :key="index"
                class="flex justify-between max-w-prose border-b px-4 py-2 mb-2 last:border-b-0 last:mb-0"
            >
                <div>
                    <h3 class="font-medium">
                        {{ log.report.title }}
                    </h3>
                    <time :datetime="log.date.toISOString()" class="text-xs text-gray-700">
                        {{ renderDate(log.date) }}
                    </time>
                    <CoreMarkdown v-if="log.report.description" :text="log.report.description" />
                </div>
                <CoreButton
                    clear
                    :aria-label="$t('errors.viewDetails')"
                    :title="$t('errors.viewDetails')"
                    @click="$ui.openModal(ErrorReportModal, { reports: [log.report] }), close()"
                >
                    <i-zondicons-view-show class="w-4 h-4" aria-hidden="true" />
                </CoreButton>
            </li>
        </ol>
    </AppModal>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

import { translate } from '@/framework/utils/translate';

import ErrorReportModal from '@/components/modals/ErrorReportModal.vue';
import Errors from '@/framework/core/facades/Errors';

const now = Date.now();

function renderDate(date: Date): string {
    const seconds = Math.round((now - date.getTime()) / 1000);

    if (seconds > 60) {
        return translate('time.minutesAgo', { minutes: Math.round(seconds / 60) });
    }

    return translate('time.secondsAgo', { seconds });
}

onMounted(() => Errors.seeAll());
</script>
