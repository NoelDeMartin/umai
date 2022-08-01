<template>
    <div class="flex flex-col flex-grow w-full h-full justify-center items-center p-4 space-y-4">
        <i-app-scanning class="w-12 h-12 text-primary-500" />
        <p class="text-xl text-gray-700">
            {{ $t('webImport.scanning') }}
        </p>
    </div>
</template>

<script setup lang="ts"></script>
