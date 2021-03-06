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

interface Data {
    loggedIn: boolean;
}

export default defineComponent({
    name: 'App',
    components: {
        Home,
        Login,
    },
    data(): Data {
        return { loggedIn: false };
    },
});
</script>
