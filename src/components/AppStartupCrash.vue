<template>
    <AppPage class="px-edge">
        <i-app-umai class="h-auto w-[250px] max-w-[60vw] fill-red-600" aria-hidden="true" />
        <h1 class="text-red-600 mt-2 text-2xl font-medium">
            {{ $t('startupCrash.title') }}
        </h1>
        <CoreMarkdown :text="$t('startupCrash.message')" class="text-center mt-4" />
        <div class="mt-4 space-y-4 flex flex-col">
            <CoreButton
                secondary
                color="danger"
                alignment="center"
                @click="$errors.inspect($errors.startupErrors)"
            >
                <i-pepicons-loop class="w-5 h-5" aria-hidden="true" />
                <span class="ml-1">{{ $t('startupCrash.inspect') }}</span>
            </CoreButton>
            <CoreButton
                secondary
                color="danger"
                alignment="center"
                @click="$app.reload()"
            >
                <i-pepicons-reload class="w-5 h-5" aria-hidden="true" />
                <span class="ml-1">{{ $t('startupCrash.reload') }}</span>
            </CoreButton>
            <CoreButton
                v-if="$auth.hasLoggedIn"
                secondary
                color="danger"
                alignment="center"
                @click="$auth.logout(true).then(() => $app.reload())"
            >
                <i-pepicons-leave class="w-5 h-5" aria-hidden="true" />
                <span class="ml-1">{{ $t('startupCrash.logout') }}</span>
            </CoreButton>
        </div>
    </AppPage>
</template>

<script setup lang="ts"></script>
