<template>
    <AppModal :title="$t('settings.title')" no-padding>
        <hr class="mt-3">
        <div class="flex flex-col items-start p-4">
            <CoreSelect
                label-class="flex self-stretch justify-between items-center"
                label-text-class="font-medium text-gray-900"
                :label="$t('settings.language')"
                :model-value="$i18n.locale"
                :options="localesOptions"
                @update:modelValue="(locale: string) => $lang.change(locale)"
            />
            <CoreMarkdown :text="$t('settings.language_description')" class="text-sm text-gray-500" />
        </div>
        <hr>
        <CoreToggle
            v-model="$ui.animations"
            class="p-4"
            :label="$t('settings.animations')"
            :description="$t('settings.animations_description')"
        />
        <hr>
        <template v-if="$browser.supportsWakeLocking">
            <CoreToggle
                v-model="$kitchen.wakeLock"
                class="p-4"
                :label="$t('settings.wakeLock')"
                :description="$t('settings.wakeLock_description')"
            />
            <hr>
        </template>
        <template v-if="$errors.sentryConfigured">
            <CoreToggle
                v-model="$errors.reporting"
                class="p-4"
                :label="$t('settings.errorReporting')"
                :description="$t('settings.errorReporting_description')"
            />
            <hr>
        </template>
        <div class="p-4">
            <CoreToggle
                v-model="$config.useProxy"
                :label="$t('settings.proxy')"
                :description="$t('settings.proxy_description')"
            />

            <div v-if="$config.useProxy" class="flex flex-col mt-2">
                <label for="proxy-url" class="font-medium text-sm text-gray-700">
                    {{ $t('settings.proxyUrl') }}
                </label>
                <CoreInput
                    id="proxy-url"
                    v-model="$config.proxyUrl"
                    bordered
                    class="mt-2"
                    :placeholder="$app.env('DEFAULT_PROXY_URL')"
                />
            </div>
        </div>
    </AppModal>
</template>

<script setup lang="ts">
import Lang from '@/framework/core/facades/Lang';
import { defineSelectOption } from '@/framework/components/headless/HeadlessSelect';

const localesOptions = $computed(() => {
    return Lang.locales.map(locale => defineSelectOption<string>({
        text: Lang.displayNames[locale] ?? locale,
        value: locale,
    }));
});
</script>
