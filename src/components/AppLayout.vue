<template>
    <div class="flex overflow-y-auto flex-col w-screen h-screen text-base antialiased font-normal leading-tight">
        <AppHeader />
        <div class="flex flex-grow justify-center self-stretch">
            <slot />
        </div>
        <AppFooter />
    </div>
</template>
