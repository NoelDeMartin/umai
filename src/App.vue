<template>
    <div class="flex flex-col w-screen h-screen items-center justify-center bg-yellow-50">
        <span v-if="isRamenAvailable" class="text-9xl">🍜</span>
        <span v-else class="text-3xl text-center">😢 No ramen available!</span>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Ramen from './Ramen';

export default defineComponent({
    name: 'App',
    data: () => ({ isRamenAvailable: Ramen.isItAvailable() }),
    mounted() {
        if (this.isRamenAvailable)
            return;

        Ramen.letMeKnowWhenItIsAvailable(() => this.isRamenAvailable = true);
    },
});
</script>
