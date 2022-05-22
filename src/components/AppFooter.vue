<template>
    <footer
        class="flex items-center justify-end space-x-1 p-4 text-sm text-primary-700 opacity-75"
    >
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
