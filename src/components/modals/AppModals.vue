<template>
    <aside v-if="$ui.modals.length > 0">
        <component
            :is="modal.component"
            v-for="modal of $ui.modals"
            :key="modal.id"
            :modal="modal"
        />
    </aside>
</template>

<script setup lang="ts"></script>
