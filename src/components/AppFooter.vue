<template>
    <footer class="flex justify-end items-center p-4 space-x-1 text-sm opacity-75 text-primary-700">
        <BaseLink
            title="View application source code"
            :url="$app.sourceUrl"
            class="mx-1"
        >
            {{ $t('footer.source') }}
        </BaseLink>
        <span>|</span>
        <span>{{ $app.versionName }}</span>
    </footer>
</template>

<script setup lang="ts"></script>
