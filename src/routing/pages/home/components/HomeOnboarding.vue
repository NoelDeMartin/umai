<template>
    <BaseHeading id="home-title">
        {{ $t('home.onboarding.title') }}
    </BaseHeading>
    <div class="flex flex-col items-center self-center">
        <p class="prose mb-4">
            {{ $t('home.onboarding.message') }}
        </p>
        <RecipeCreateOptions />
    </div>
</template>

<script setup lang="ts"></script>
