<template>
    <Menu as="div" class="flex relative items-center">
        <div>
            <MenuButton as="template">
                <AppHeaderButton
                    :aria-label="$t('menu.open')"
                    :title="$t('menu.open')"
                >
                    <i-pepicons-gear-filled class="w-7 h-7" aria-hidden="true" />
                </AppHeaderButton>
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
            <MenuItems class="absolute right-0 top-full py-1 mt-2 w-48 bg-white rounded-md ring-1 ring-black ring-opacity-5 shadow-lg origin-top-right focus:outline-none">
                <MenuItem v-slot="{ active }">
                    <button
                        type="button"
                        :class="[
                            'flex items-center justify-between px-4 py-2 w-full text-sm text-gray-700',
                            active && 'bg-gray-100',
                        ]"
                        @click="$ui.openModal(SettingsModal)"
                    >
                        <span>{{ $t('menu.settings') }}</span>
                        <i-pepicons-tool class="w-4 h-4" aria-hidden="true" />
                    </button>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                    <button
                        type="button"
                        :class="[
                            'flex items-center justify-between px-4 py-2 w-full text-sm text-gray-700',
                            active && 'bg-gray-100',
                        ]"
                        @click="$auth.hasLoggedIn ? $auth.logout() : $ui.openModal(CloudStatusModal)"
                    >
                        <span>{{ $auth.hasLoggedIn ? $t('menu.logOut') : $t('menu.logIn') }}</span>
                        <i-pepicons-leave class="w-4 h-4" aria-hidden="true" />
                    </button>
                </MenuItem>
            </MenuItems>
        </transition>
    </Menu>
</template>

<script setup lang="ts">
import CloudStatusModal from '@/components/modals/CloudStatusModal.vue';
import SettingsModal from '@/components/modals/SettingsModal.vue';
</script>
