<template>
    <Menu as="div" class="flex relative items-center">
        <div>
            <MenuButton as="template">
                <AppHeaderButton
                    :aria-label="$t('menu.open')"
                    :title="$t('menu.open')"
                >
                    <i-pepicons-gear class="w-7 h-7" aria-hidden="true" />
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
