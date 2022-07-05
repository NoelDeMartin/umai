<template>
    <CloudLoginModal v-if="$cloud.disconnected" />
    <AppModal v-else v-slot="{ close }" :title="title">
        <div v-if="$cloud.online">
            <p
                v-safe-html="$t('cloud.statuses.online_description', {
                    url: $auth.user?.webId,
                    name: $auth.user?.name ?? $auth.user?.webId,
                })"
                class="prose"
            />
            <CloudConfiguration class="mt-4" />
            <div class="flex flex-row-reverse space-x-2 space-x-reverse mt-4">
                <CoreButton
                    v-initial-focus
                    secondary
                    color="brand-solid"
                    @click="$cloud.sync(), close()"
                >
                    <i-pepicons-refresh class="w-6 h-6" aria-hidden="true" />
                    <span class="ml-2">{{ $t('cloud.sync_now') }}</span>
                </CoreButton>
                <CoreButton
                    secondary
                    color="danger"
                    @click="$auth.logout(), close()"
                >
                    <i-pepicons-leave class="w-6 h-6" aria-hidden="true" />
                    <span class="ml-2">{{ $t('cloud.logout') }}</span>
                </CoreButton>
            </div>
        </div>
        <template v-else>
            <p class="prose">
                {{ body }}
            </p>
            <CloudConfiguration class="mt-4" />
        </template>
    </AppModal>
</template>

<script setup lang="ts">
import { stringCapitalize } from '@noeldemartin/utils';

import Cloud from '@/framework/core/facades/Cloud';
import { translate } from '@/framework/utils/translate';

const title = $computed(() => stringCapitalize(translate(`cloud.statuses.${Cloud.status}`)));
const body = $computed(() => stringCapitalize(translate(`cloud.statuses.${Cloud.status}_description`)));
</script>
