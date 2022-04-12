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
            <BaseButton
                secondary
                class="mt-4 w-full"
                @click="$cloud.sync(), close()"
            >
                <span>{{ $t('cloud.sync_now') }}</span>
            </BaseButton>
            <BaseButton
                secondary
                class="mt-2 w-full"
                @click="$auth.logout(), close()"
            >
                <span>{{ $t('cloud.logout') }}</span>
                <i-heroicons-solid-logout class="ml-2" aria-hidden="true" />
            </BaseButton>
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
import { useI18n } from 'vue-i18n';

import Cloud from '@/framework/core/facades/Cloud';

const { t } = useI18n();
const title = $computed(() => stringCapitalize(t(`cloud.statuses.${Cloud.status}`)));
const body = $computed(() => stringCapitalize(t(`cloud.statuses.${Cloud.status}_description`)));
</script>
