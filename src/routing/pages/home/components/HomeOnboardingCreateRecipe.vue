<template>
    <CoreMarkdown :text="$t('home.onboarding.createRecipe_info')" />
    <RecipeCreateOptions class="mt-4" />
    <CoreLink class="mt-4 text-sm" @click="$emit('cancel')">
        {{ $t('home.onboarding.back') }}
    </CoreLink>
</template>

<script setup lang="ts">
defineEmits(['cancel']);
</script>
