<template>
    <div class="flex flex-col items-center justify-center w-screen h-screen text-base antialiased font-normal leading-tight">
        <AppHeader />
        <div class="flex self-stretch flex-grow">
            <slot />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({});
</script>
