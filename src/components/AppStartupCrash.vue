<template>
    <AppPage class="px-edge">
        <h1 class="text-red-700 text-2xl font-semibold">
            {{ $t('startupCrash.title') }}
        </h1>
        <CoreMarkdown :text="$t('startupCrash.message')" class="text-center mt-4" />
        <div class="mt-4 space-y-4 flex flex-col">
            <CoreButton
                secondary
                alignment="center"
                @click="$app.reload()"
            >
                {{ $t('startupCrash.reload') }}
            </CoreButton>
            <CoreButton
                v-if="$auth.hasLoggedIn"
                secondary
                alignment="center"
                @click="$auth.logout(true).then(() => $app.reload())"
            >
                {{ $t('startupCrash.logout') }}
            </CoreButton>
            <CoreButton
                secondary
                alignment="center"
                @click="$errors.inspect($errors.startupErrors)"
            >
                {{ $t('startupCrash.inspect') }}
            </CoreButton>
        </div>
    </AppPage>
</template>

<script setup lang="ts"></script>
