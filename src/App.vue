<template>
    <AppLayout>
        <Home v-if="loggedIn" />
        <Login v-else @login="loggedIn = true" />
    </AppLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Home from '@/pages/Home.vue';
import Login from '@/pages/Login.vue';

export default defineComponent({
    name: 'App',
    components: { Home, Login },
    data: () => ({ loggedIn: false }),
});
</script>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>
