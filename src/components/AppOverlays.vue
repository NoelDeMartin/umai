<template>
    <aside v-if="modal">
        <component
            :is="modal.component"
            v-if="modal"
            :child-index="1"
            :modal="modal"
            v-bind="modal.props"
        />
    </aside>
    <AppSnackbars v-else />
</template>

<script setup lang="ts">
import UI from '@/framework/core/facades/UI';

const modal = $computed(() => UI.modals[0] ?? null);
</script>
