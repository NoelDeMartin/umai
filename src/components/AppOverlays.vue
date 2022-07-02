<template>
    <div ref="$backdrop" class="fixed inset-0 bg-black/30 pointer-events-none z-50 opacity-0" />
    <aside v-if="modal">
        <component
            :is="modal.component"
            :child-index="1"
            :modal="modal"
            v-bind="modal.props"
        />
    </aside>
    <AppSnackbars />
</template>

<script setup lang="ts">
import UI from '@/framework/core/facades/UI';
import { useEvent } from '@/framework/utils/composition/events';
import { fadeIn, fadeOut } from '@/framework/utils/transitions';

let backdropHidden = $ref(true);
const $backdrop = $ref<HTMLElement | null>(null);
const modal = $computed(() => UI.modals[0] ?? null);

useEvent('show-overlays-backdrop', async () => {
    if (!$backdrop || !backdropHidden) {
        return;
    }

    backdropHidden = false;

    $backdrop.classList.remove('opacity-0');

    await fadeIn($backdrop, { duration: 300, easing: 'ease-out' });
});

useEvent('hide-overlays-backdrop', async () => {
    if (!$backdrop || backdropHidden) {
        return;
    }

    backdropHidden = true;

    await fadeOut($backdrop, { duration: 200, easing: 'ease-in' });

    $backdrop.classList.add('opacity-0');
});
</script>
