<template>
    <div class="prose">
        <p>{{ $t('home.onboarding.createRecipe_info') }}</p>
    </div>
    <RecipeCreateOptions class="mt-4" />
    <CoreLink class="mt-4 text-sm" @click="$emit('cancel')">
        {{ $t('home.onboarding.back') }}
    </CoreLink>
</template>

<script setup lang="ts">
defineEmits(['cancel']);
</script>
