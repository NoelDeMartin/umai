<template>
    <footer class="flex justify-center items-center p-4 space-x-2">
        <template v-if="$auth.isLoggedIn()">
            <button
                type="button"
                title="Sync"
                aria-label="Sync"
                class="relative w-6 h-6 group"
                @click="$cloud.sync()"
            >
                <i-zondicons-cloud class="absolute inset-0 w-full h-full text-gray-500 group-hover:text-indigo-500" />
                <div class="flex absolute inset-0 justify-center items-center w-full h-full text-gray-200">
                    <i-zondicons-refresh v-if="!$cloud.idle" class="w-3 h-3 animate-spin" />
                    <template v-else>
                        <i-zondicons-refresh class="hidden w-3 h-3 group-hover:block" />
                        <span v-if="$cloud.dirty" class="text-xs group-hover:hidden">{{ $cloud.pendingUpdates.length }}</span>
                        <i-zondicons-checkmark v-else class="w-2 h-3 group-hover:hidden" />
                    </template>
                </div>
            </button>
            <span class="text-sm text-gray-500">
                you're connected to <a :href="$auth.user.storageUrls[0]" class="underline hover:text-gray-700" target="_blank">{{ $auth.user.storageUrls[0] }}</a>
            </span>
            <button
                type="button"
                class="text-gray-500 hover:text-red-500"
                title="Log out"
                aria-label="Log out"
                @click="$auth.logout()"
            >
                <i-heroicons-solid-logout />
            </button>
        </template>
        <template v-else-if="$auth.previousSession?.loginUrl">
            <button
                type="button"
                class="text-sm text-indigo-500 underline hover:text-indigo-700"
                @click="$auth.reconnect()"
            >
                Reconnect to {{ $auth.previousSession?.loginUrl }}
            </button>
            <button
                type="button"
                class="text-gray-500 hover:text-red-500"
                title="Log out"
                @click="$auth.logout()"
            >
                <i-heroicons-solid-logout />
            </button>
        </template>
        <button
            v-else
            type="button"
            class="text-sm text-indigo-500 underline hover:text-indigo-700"
            @click="login()"
        >
            Connect storage
        </button>
    </footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Auth from '@/framework/core/facades/Auth';
import type { AuthenticatorName } from '@/framework/auth';

export default defineComponent({
    setup() {
        const login = () => {
            const loginUrl = prompt('Login url?', 'https://');
            const authenticator =
                new URL(location.href).searchParams.get('authenticator') as AuthenticatorName ?? 'default';

            loginUrl && Auth.login(loginUrl, authenticator);
        };

        return { login };
    },
});
</script>
