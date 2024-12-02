<template>
    <div class="flex flex-col items-center justify-center flex-grow w-full h-full p-8">
        <p v-if="$cloud.syncing" class="font-medium text-2xl">
            {{ $t('errors.notFound_syncing') }}
        </p>
        <template v-else>
            <h1 class="font-medium text-2xl">
                {{ $t('errors.notFound') }}
            </h1>
            <CoreLink route="home" class="mt-2 !flex items-center">
                <span>{{ $t('errors.notFound_goHome') }}</span>
                <i-pepicons-arrow-right class="ml-1 mt-0.5 h-5 w-5" />
            </CoreLink>
            <p v-if="!$auth.isLoggedIn()" class="text-center text-sm text-gray-500 mt-4">
                {{
                    loginTextPrefix
                }}<CoreLink
                    class="text-gray-500 underline hover:text-gray-700"
                    @click="$ui.openModal(AppLoginModal)"
                >
                    {{ loginText }}
                </CoreLink>{{
                    loginTextSuffix
                }}
            </p>
        </template>
    </div>
</template>

<script setup lang="ts">
import { translate } from '@/framework/utils/translate';

import AppLoginModal from '@/components/modals/AppLoginModal.vue';

const notFoundLogin = translate('errors.notFound_login');
const loginText = translate('errors.notFound_loginButton');
const [loginTextPrefix, loginTextSuffix] = notFoundLogin.split('%LOGIN_BUTTON%');
</script>
