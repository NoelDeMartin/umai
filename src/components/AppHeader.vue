<template>
    <header
        ref="$header"
        class="flex relative z-40 flex-col items-center self-stretch pt-edge h-24 transition-colors duration-700 shrink-0"
        :class="{
            'invisible': $ui.headerHidden,
            'text-white': $route.meta.fullBleedHeader && !$app.onboardingCompleting,
            'opacity-0 pointer-events-none': $app.isOnboarding,
            'transition-opacity opacity-100 duration-500': $app.onboardingCompleting,
        }"
    >
        <div class="flex relative z-10 justify-between items-center w-full max-w-content px-edge">
            <div class="relative flex-grow h-full">
                <transition
                    enter-active-class="transition duration-700"
                    :enter-from-class="navigationButtonClasses.enterFrom"
                    enter-to-class="opacity-100"
                    leave-active-class="transition duration-700"
                    leave-from-class="opacity-100"
                    :leave-to-class="navigationButtonClasses.leaveTo"
                >
                    <div
                        v-if="navigationButton === 'logo'"
                        class="flex absolute left-0 top-1/2 w-full text-gray-900 -translate-y-1/2"
                    >
                        <router-link
                            v-wobbly-border
                            :to="{ name: 'home' }"
                            title="Umai"
                            class="flex ring-primary-100 justify-center items-center space-x-2 focus-visible:outline-none focus-visible:bg-primary-100 focus-visible:ring-8"
                        >
                            <i-app-umai class="mr-2 w-36 h-12 fill-primary-600" />
                        </router-link>
                    </div>
                    <div
                        v-else-if="navigationButton === 'back-arrow'"
                        class="flex absolute left-0 top-1/2 items-center -translate-y-1/2 w-full"
                    >
                        <CoreButton
                            clear
                            class="text-white hover:bg-transparent focus:bg-transparent focus:ring-0 focus:ring-offset-0 focus-visible:bg-black/20 focus:hover:bg-transparent"
                            @click="$router.previousRouteWas('home') ? $router.back() : $router.push({ name: 'home' })"
                        >
                            <span aria-hidden="true" class="mr-2">&larr; </span>
                            <span>{{ $t('menu.back') }}</span>
                        </CoreButton>
                    </div>
                </transition>
            </div>
            <div class="flex space-x-2">
                <AppHeaderCloudStatus v-if="!$auth.dismissed" />
                <AppHeaderUserMenu />
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { watch } from 'vue';

import App from '@/framework/core/facades/App';
import Router from '@/framework/core/facades/Router';
import UI from '@/framework/core/facades/UI';
import { useResizeObserver } from '@/framework/utils/composition/observers';

let navigationButtonClasses = $ref({ enterFrom: 'opacity-0', leaveTo: 'opacity-0' });
const $header = $ref<HTMLElement | null>(null);
const navigationButton = $computed(() => {
    if (
        App.isOnboarding ||
        App.onboardingCompleting ||
        Router.currentRouteIs(/recipes\.(edit|create)/)
    ) {
        return null;
    }

    if (!Router.currentRouteIs('home')) {
        return 'back-arrow';
    }

    return 'logo';
});

watch($$(navigationButton), (newValue, oldValue) => {
    navigationButtonClasses = (() => {
        if (!oldValue) {
            return {
                enterFrom: 'opacity-0 -translate-x-full',
                leaveTo: 'opacity-0 -translate-x-full',
            };
        }

        if (newValue === 'logo') {
            return {
                enterFrom: 'opacity-0 -translate-x-full',
                leaveTo: 'opacity-0 translate-x-full',
            };
        }

        return {
            enterFrom: 'opacity-0 translate-x-full',
            leaveTo: 'opacity-0 -translate-x-full',
        };
    })();
});

useResizeObserver($$($header), $header => UI.updateHeaderHeight($header.clientHeight));
</script>
