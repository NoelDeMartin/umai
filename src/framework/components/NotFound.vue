<template>
    <div class="flex flex-col items-center justify-center flex-grow w-full h-full p-8">
        <h1 class="font-medium text-2xl">
            {{ $t('errors.notFound') }}
        </h1>
        <CoreLink route="home" class="mt-2">
            {{ $t('errors.notFound_goHome') }}
        </CoreLink>
    </div>
</template>
