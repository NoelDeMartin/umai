<template>
    <div class="flex flex-col items-center justify-center flex-grow max-w-2xl p-8 m-auto">
        <p v-if="!$cookbook.recipes">
            <loading-dots class="w-16 h-12 text-indigo-500" />
        </p>
        <div v-else class="w-full bg-white rounded shadow">
            <RecipesList :recipes="$cookbook.recipes" />

            <div class="p-4">
                <router-link
                    :to="{ name: 'recipes.create' }"
                    class="block w-full px-4 py-2 text-sm font-medium text-center text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    New Recipe
                </router-link>
            </div>
        </div>
    </div>
</template>
