<template>
    <CloudLoginModal v-if="$cloud.disconnected" />
    <AppModal v-else v-slot="{ close }" :title="title">
        <div v-if="$cloud.online" class="prose">
            <p
                v-safe-html="$t('cloud.statuses.online_description', {
                    url: $auth.user?.webId,
                    name: $auth.user?.name ?? $auth.user?.webId,
                })"
            />
            <BaseButton
                secondary
                class="w-full"
                @click="$auth.logout(), close()"
            >
                <span>{{ $t('cloud.logout') }}</span>
                <i-heroicons-solid-logout class="ml-2" aria-hidden="true" />
            </BaseButton>
        </div>
        <p v-else>
            {{ body }}
        </p>
    </AppModal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import Cloud from '@/framework/core/facades/Cloud';

// TODO move to @noeldemartin/utils
function stringCapitalize(text: string): string {
    return text[0].toUpperCase() + text.slice(1);
}

const { t } = useI18n();
const title = $computed(() => stringCapitalize(t(`cloud.statuses.${Cloud.status}`)));
const body = $computed(() => stringCapitalize(t(`cloud.statuses.${Cloud.status}_description`)));
</script>
