<template>
    <ul class="w-full">
        <li v-if="$slots.servings" class="h-10 flex items-center justify-between">
            <div class="flex items-center space-x-2">
                <i-pepicons-knive-fork class="w-4 h-4" aria-hidden="true" />
                <span>{{ $t('recipes.servings') }}</span>
            </div>
            <slot name="servings" />
        </li>
        <li v-if="$slots.prepTime" class="h-10 flex items-center justify-between">
            <div class="flex items-center space-x-2">
                <i-pepicons-hourglass class="w-4 h-4" aria-hidden="true" />
                <span>{{ $t('recipes.prepTime') }}</span>
            </div>
            <slot name="prepTime" />
        </li>
        <li v-if="$slots.cookTime" class="h-10 flex items-center justify-between">
            <div class="flex items-center space-x-2">
                <i-pepicons-stopwatch class="w-4 h-4" aria-hidden="true" />
                <span>{{ $t('recipes.cookTime') }}</span>
            </div>
            <slot name="cookTime" />
        </li>
    </ul>
</template>

<script setup lang="ts"></script>
