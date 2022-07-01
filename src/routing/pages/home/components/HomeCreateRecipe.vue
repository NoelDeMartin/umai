<template>
    <div class="flex flex-col w-full justify-center items-center mt-16">
        <HomeHeading>
            {{ $t('home.createRecipe.title') }}
        </HomeHeading>
        <CoreMarkdown :text="$t('home.createRecipe.message')" />
        <RecipeCreateOptions class="mt-8" />
    </div>
</template>

<script setup lang="ts"></script>
