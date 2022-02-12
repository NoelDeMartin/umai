<template>
    <BaseHeading id="home-title">
        {{ $t('home.onboarding.title') }}
    </BaseHeading>
    <div class="flex flex-col items-center self-center">
        <p class="mb-4 prose">
            {{ $t('home.onboarding.message') }}
        </p>
        <RecipeCreateOptions />
    </div>
</template>

<script setup lang="ts"></script>
