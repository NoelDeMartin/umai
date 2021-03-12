<template>
    <div class="flex items-center justify-center flex-grow p-8">
        <button
            type="button"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            @click="$auth.login"
        >
            Log In
        </button>
    </div>
</template>
