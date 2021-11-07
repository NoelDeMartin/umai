<template>
    <div class="flex flex-col justify-center items-center w-screen h-screen text-base antialiased font-normal leading-tight">
        <AppHeader />
        <div class="flex flex-grow justify-center self-stretch">
            <slot />
        </div>
        <AppFooter />
    </div>
</template>
