<template>
    <footer class="flex items-center justify-center p-4 space-x-2">
        <template v-if="$auth.isLoggedIn()">
            <button
                type="button"
                title="Sync"
                aria-label="Sync"
                class="relative w-6 h-6 group"
                @click="sync()"
            >
                <i-zondicons-cloud class="absolute inset-0 w-full h-full text-gray-500 group-hover:text-indigo-500" />
                <div class="absolute inset-0 flex items-center justify-center w-full h-full text-gray-200">
                    <i-zondicons-refresh v-if="syncing" class="w-3 h-3 animate-spin" />
                    <template v-else>
                        <i-zondicons-refresh class="hidden w-3 h-3 group-hover:block" />
                        <span v-if="$cloud.dirty" class="text-xs group-hover:hidden">{{ $cloud.dirtyOperations.length }}</span>
                        <i-zondicons-checkmark v-else class="w-2 h-3 group-hover:hidden" />
                    </template>
                </div>
            </button>
            <span class="text-sm text-gray-500">
                you're connected to <a :href="$auth.user.storageUrl" class="underline hover:text-gray-700" target="_blank">{{ $auth.user.storageUrl }}</a>
            </span>
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
            @click="$auth.login()"
        >
            Connect storage
        </button>
    </footer>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

import Cloud from '@/framework/core/facades/Cloud';
import { after } from '@noeldemartin/utils';

export default defineComponent({
    setup() {
        const syncing = ref(false);
        const sync = async () => {
            const start = Date.now();

            syncing.value = true;
            await Cloud.sync();
            await after({ milliseconds: Math.max(0, 1000 - (Date.now() - start)) });
            syncing.value = false;
        };

        return { syncing, sync };
    },
});
</script>
