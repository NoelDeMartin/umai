<template>
    <footer v-if="$auth.isLoggedIn()" class="flex items-center justify-center p-4 space-x-2">
        <span class="text-sm text-gray-500">logged in as <i>{{ $auth.user.name }}</i></span>
        <button
            type="button"
            class="text-gray-500 hover:text-red-500"
            title="Log out"
            @click="$auth.logout"
        >
            <i-heroicons-solid-logout />
        </button>
    </footer>
</template>
