<template>
    <div class="flex flex-col items-center justify-center w-screen h-screen text-base antialiased font-normal leading-tight bg-gray-100">
        <AppHeader />
        <div class="flex self-stretch flex-grow">
            <slot />
        </div>
        <AppFooter />
    </div>
</template>
