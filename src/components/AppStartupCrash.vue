<template>
    <main class="flex flex-col items-center justify-center w-full h-full max-w-content mx-edge">
        <h1 class="text-red-700 text-2xl font-semibold">
            {{ $t('startupCrash.title') }}
        </h1>
        <CoreMarkdown :text="$t('startupCrash.message')" class="text-center mt-4" />
        <div class="mt-4 space-y-4 flex flex-col">
            <CoreButton
                secondary
                alignment="center"
                @click="reload()"
            >
                {{ $t('startupCrash.reload') }}
            </CoreButton>
            <CoreButton
                v-if="$auth.hasLoggedIn"
                secondary
                alignment="center"
                @click="$auth.logout()"
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
    </main>
</template>

<script setup lang="ts">
function reload() {
    location.reload();
}
</script>
