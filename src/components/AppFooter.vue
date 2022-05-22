<template>
    <footer
        class="flex items-center space-x-1 p-4 text-sm font-medium text-primary-900 opacity-75"
        :class="$app.isOnboarding ? 'justify-center' : 'justify-start'"
    >
        <CoreLink
            class="font-medium"
            @click="
                $ui.showMarkdown($t('footer.about_title'), $t('footer.about_content', { sourceUrl: $app.sourceUrl }))
            "
        >
            {{ $t('footer.about') }}
        </CoreLink>
        <span>|</span>
        <CoreLink :title="$t('footer.source_title')" :url="$app.sourceUrl" class="mx-1 font-medium">
            {{ $t('footer.source') }}
        </CoreLink>
        <span>|</span>
        <CoreLink :title="$t('footer.version_title')" :url="$app.releaseNotesUrl" class="mx-1 font-medium">
            {{ $app.versionName }}
        </CoreLink>
    </footer>
</template>

<script setup lang="ts"></script>
