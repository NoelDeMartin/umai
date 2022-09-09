<template>
    <AppModal :cancellable="false">
        <CoreMarkdown :text="displayText" />
        <div class="h-4 rounded-full overflow-hidden w-full bg-primary-200 mt-2 min-w-modal-content md:min-w-modal-content-md">
            <div class="progress-bar-content bg-primary-500 rounded-full h-full" />
        </div>
    </AppModal>
</template>

<script setup lang="ts">
import { stringProp } from '@/framework/utils/vue';
import { translate } from '@/framework/utils/translate';

const { text } = defineProps({
    text: stringProp(),
});
const displayText = $computed(() => text ?? translate('ui.loading'));
</script>

<style>
.progress-bar-content {
    width: 40%;
    animation: progress-bar 1s infinite linear;
}

 @keyframes progress-bar {
    0% { margin-left: -40%; }
    100% { margin-left: 100%; }
}
</style>
