<template>
    <AppPage>
        <i-app-umai class="h-auto w-[250px] max-w-[60vw] fill-red-600" aria-hidden="true" />
        <h1 class="text-red-600 mt-2 text-2xl font-medium">
            {{ report.title }}
        </h1>
        <CoreMarkdown
            v-if="report.description"
            :text="report.description"
            class="text-center mt-4"
        />
        <template v-if="isIndexedDBError">
            <CoreMarkdown
                v-if="$browser.isFirefox"
                :text="$t('errors.unsupportedBrowser_indexedDBHelpFirefox')"
                class="mt-1"
            />
            <CoreButton url="https://caniuse.com/#feat=indexeddb" color="danger" class="mt-3">
                {{ $t('errors.unsupportedBrowser_indexedDBHelp') }}
            </CoreButton>
        </template>
    </AppPage>
</template>

<script setup lang="ts">
import { requiredObjectProp } from '@/framework/utils/vue';
import { translate } from '@/framework/utils/translate';
import type { ErrorReport } from '@/framework/core/services/ErrorsService';

const { report } = defineProps({
    report: requiredObjectProp<ErrorReport>(),
});

const isIndexedDBError = $computed(() => report.description === translate('errors.unsupportedBrowser_indexedDB'));
</script>
