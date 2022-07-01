<template>
    <div>
        <slot />
    </div>
</template>

<script setup lang="ts">
import { provide } from 'vue';
import { uuid } from '@noeldemartin/utils';

provide('input-wrapper-id', uuid());
</script>
