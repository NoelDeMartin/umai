<template>
    <AppModal v-slot="{ close }" :title="$t('recipes.new.title')">
        <RecipeCreateOptions class="mt-2" @option-selected="close()" />
    </AppModal>
</template>

<script setup lang="ts"></script>
