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
                @click="$app.reload()"
            >
                <span class="mr-1">{{ $t('startupCrash.reload') }}</span>
                <div class="flex-grow" />
                <i-pepicons-arrow-right class="w-5 h-5" aria-hidden="true" />
            </CoreButton>
            <CoreButton
                v-if="$auth.hasLoggedIn"
                secondary
                color="danger"
                @click="$app.reload({ autoReconnect: 'false' })"
            >
                <span class="mr-1">{{ $t('startupCrash.reloadWithoutAutoReconnect') }}</span>
                <div class="flex-grow" />
                <i-pepicons-arrow-right class="w-5 h-5" aria-hidden="true" />
            </CoreButton>
            <CoreButton
                v-if="$auth.hasLoggedIn"
                secondary
                color="danger"
                @click="$auth.logout(true).then(() => $app.reload())"
            >
                <span class="mr-1">{{ $t('startupCrash.logout') }}</span>
                <div class="flex-grow" />
                <i-pepicons-arrow-right class="w-5 h-5" aria-hidden="true" />
            </CoreButton>
            <CoreButton
                secondary
                color="danger"
                @click="$errors.inspect($errors.startupErrors)"
            >
                <span class="mr-1">{{ $t('startupCrash.inspect') }}</span>
                <div class="flex-grow" />
                <i-pepicons-arrow-right class="w-5 h-5" aria-hidden="true" />
            </CoreButton>
        </div>
    </AppPage>
</template>

<script setup lang="ts"></script>
