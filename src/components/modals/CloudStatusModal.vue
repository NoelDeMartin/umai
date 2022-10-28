<template>
    <CloudStatusModalDisconnected v-if="$cloud.disconnected" />
    <CloudStatusModalConnected v-else />
</template>

<script setup lang="ts"></script>
