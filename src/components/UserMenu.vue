<template>
    <Menu as="div" class="flex relative items-center">
        <div>
            <MenuButton
                :class="[
                    'flex text-sm rounded-full',
                    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-600',
                    'hover:outline-none hover:ring-2 hover:ring-offset-2 hover:ring-offset-white hover:ring-indigo-600',
                ]"
            >
                <span class="sr-only">{{ $t('menu.open') }}</span>
                <div v-if="$auth.isLoggedIn()" class="w-8 h-8 bg-gray-800 rounded-full" aria-hidden="true">
                    <img
                        v-if="$auth.user.avatarUrl"
                        :src="$auth.user.avatarUrl"
                        class="w-full h-full rounded-full"
                        alt=""
                    >
                    <div v-else class="flex justify-center items-center w-full h-full font-bold text-white bg-indigo-400 rounded-full">
                        {{ $auth.user.name?.[0]?.toUpperCase() ?? '?' }}
                    </div>
                </div>
                <div v-else aria-hidden="true">
                    <i-zondicons-cog class="w-6 h-6" />
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
            <MenuItems class="absolute right-0 py-1 mt-2 w-48 bg-white rounded-md ring-1 ring-black ring-opacity-5 shadow-lg origin-top-right focus:outline-none">
                <MenuItem v-slot="{ active }">
                    <button
                        type="button"
                        :class="[
                            'flex items-center px-4 py-2 w-full text-sm text-gray-700',
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
                            'flex items-center px-4 py-2 w-full text-sm text-gray-700',
                            active && 'bg-gray-100',
                        ]"
                        @click="$auth.loggedIn ? $auth.logout() : $ui.openModal(CloudStatusModal)"
                    >
                        {{ $auth.loggedIn ? $t('menu.log_out') : $t('menu.log_in') }}
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
