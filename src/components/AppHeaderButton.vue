<template>
    <CoreButton
        clear
        :class="[
            classes,
            $ui.animations && 'transition-colors duration-700',
        ]"
    >
        <slot />
    </CoreButton>
</template>

<script setup lang="ts">
import App from '@/framework/core/facades/App';
import Router from '@/framework/core/facades/Router';
import { value } from '@noeldemartin/utils';

const classes = $computed(() => {
    if (!value(Router.currentRoute.value.meta.fullBleedHeader) || App.onboardingCompleting) {
        return '';
    }

    return [
        'text-white hover:bg-black/25 focus:ring-offset-0 focus:ring-0 focus:bg-black/20',
        'focus:hover:bg-black/25 focus:ring-black/30',
    ].join(' ');
});
</script>
