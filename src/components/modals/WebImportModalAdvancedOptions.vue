<template>
    <CoreDetails :summary="$t('webImport.advancedOptions')">
        <div class="flex items-center">
            <BaseCheckbox id="use-proxy" name="useProxy" />
            <label
                for="use-proxy"
                class="ml-2 cursor-pointer inline-flex items-baseline"
                :class="{ 'opacity-50': !form.useProxy }"
            >
                <span class="flex-shrink-0">{{ $t('webImport.useProxy') }}</span>
                <CoreFluidInput
                    name="proxyUrl"
                    placeholder="https://"
                    :aria-label="$t('webImport.useProxy_urlLabel')"
                    :disabled="!form.useProxy"
                    inline
                    class="ml-1"
                    :class="{ 'pointer-events-none': !form.useProxy }"
                />
            </label>
        </div>
        <CoreLink
            class="text-sm ml-6"
            @click="$ui.showMarkdown($t('webImport.useProxy_helpTitle'), $t('webImport.useProxy_helpContent'))"
        >
            {{ $t('webImport.useProxy_help') }}
        </CoreLink>
    </CoreDetails>
</template>

<script setup lang="ts">
import { requiredObjectProp } from '@/framework/utils/vue';

import type { WebImportModalUrlForm } from './WebImportModal';

defineProps({
    form: requiredObjectProp<WebImportModalUrlForm>(),
});
</script>
