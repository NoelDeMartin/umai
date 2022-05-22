<template>
    <Menu as="div" class="relative flex items-center">
        <div>
            <MenuButton
                :class="[
                    'flex rounded-full text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-white',
                    'hover:outline-none hover:ring-2 hover:ring-indigo-600 hover:ring-offset-2 hover:ring-offset-white',
                ]"
            >
                <span class="sr-only">{{ $t('menu.open') }}</span>
                <div
                    v-if="$auth.isLoggedIn()"
                    class="h-8 w-8 rounded-full bg-gray-800"
                    aria-hidden="true"
                >
                    <img
                        v-if="$auth.user.avatarUrl"
                        :src="$auth.user.avatarUrl"
                        class="h-full w-full rounded-full"
                        alt=""
                    >
                    <div
                        v-else
                        class="flex h-full w-full items-center justify-center rounded-full bg-indigo-400 font-bold text-white"
                    >
                        {{ $auth.user.name?.[0]?.toUpperCase() ?? '?' }}
                    </div>
                </div>
                <div v-else aria-hidden="true">
                    <i-zondicons-cog class="h-6 w-6" />
                </div>
            </MenuButton>
        </div>
        <transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
        >
            <MenuItems
                class="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            >
                <MenuItem v-slot="{ active }">
                    <button
                        type="button"
                        :class="[
                            'flex w-full items-center px-4 py-2 text-sm text-gray-700',
                            active && 'bg-gray-100',
                        ]"
                        @click="openSettings"
                    >
                        {{ $t('menu.settings') }}
                    </button>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                    <button
                        type="button"
                        :class="[
                            'flex w-full items-center px-4 py-2 text-sm text-gray-700',
                            active && 'bg-gray-100',
                        ]"
                        @click="
                            $auth.loggedIn
                                ? $auth.logout()
                                : $ui.openModal(CloudStatusModal)
                        "
                    >
                        {{
                            $auth.loggedIn
                                ? $t('menu.log_out')
                                : $t('menu.log_in')
                        }}
                    </button>
                </MenuItem>
            </MenuItems>
        </transition>
    </Menu>
</template>

<script setup lang="ts">
import CloudStatusModal from '@/components/modals/CloudStatusModal.vue';

function openSettings() {
    // TODO
}
</script>
