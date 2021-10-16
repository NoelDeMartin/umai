<template>
    <div class="flex flex-col flex-grow justify-center items-center p-8 m-auto max-w-2xl">
        <p v-if="!$cookbook.recipes">
            <i-umai-loading-dots class="w-16 h-12 text-indigo-500" />
        </p>
        <div v-else class="w-full bg-white rounded shadow">
            <RecipesList :recipes="$cookbook.recipes" />

            <div class="p-4">
                <router-link
                    :to="{ name: 'recipes.create' }"
                    class="block px-4 py-2 w-full text-sm font-medium text-center text-white bg-indigo-600 rounded-md border border-transparent hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    New Recipe
                </router-link>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts"></script>
