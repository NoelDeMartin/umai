<template>
    <main aria-labelledby="#cookbook-title" class="mx-4 w-full max-w-content">
        <div class="flex justify-between">
            <h1 id="cookbook-title" class="text-2xl font-semibold">
                {{ $t('recipes.index.title') }}
            </h1>
            <BaseButton route="recipes.create">
                {{ $t('recipes.add') }}
            </BaseButton>
        </div>
        <p v-if="!$cookbook.recipes">
            <i-umai-loading-dots class="w-16 h-12 text-indigo-500" />
        </p>
        <p v-else-if="$cookbook.recipes.isEmpty()">
            {{ $t('recipes.empty') }}
        </p>
        <RecipesGrid v-else :recipes="$cookbook.recipes" class="w-full" />
    </main>
</template>

<script setup lang="ts"></script>
