<template>
    <AppModal :title="$t('settings.title')" no-padding>
        <hr class="mt-3">
        <CoreToggle
            v-model="$ui.animations"
            class="p-4"
            :label="$t('settings.animations')"
            :description="$t('settings.animations_description')"
        />
        <hr>
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

<script setup lang="ts"></script>
