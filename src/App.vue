<template>
    <AppLayout>
        <Home v-if="$auth.loggedIn" />
        <Login v-else />
    </AppLayout>
</template>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>
