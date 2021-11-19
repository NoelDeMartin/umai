<template>
    <AppLayout>
        <router-view />
    </AppLayout>
</template>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {

    .text-shadow {
        text-shadow: 0 2px 4px rgba(0, 0, 0, .9);
    }

    .text-shadow-transparent {
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0);
    }

}
</style>
