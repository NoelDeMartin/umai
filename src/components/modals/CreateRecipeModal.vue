<template>
    <AppModal v-slot="{ close }" :title="$t('recipes.new.title')">
        <RecipeCreateOptions @selected="close()" />
    </AppModal>
</template>

<script setup lang="ts"></script>
