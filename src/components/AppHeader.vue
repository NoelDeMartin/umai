<template>
    <header
        ref="$header"
        class="flex relative z-40 flex-col items-center self-stretch pt-edge h-24 shrink-0 print:hidden"
        :inert="$ui.headerHidden || $app.isOnboarding"
        :class="{
            'invisible': $ui.headerHidden || $app.isOnboarding,
            'text-white': value($route.meta.fullBleedHeader) && !$app.onboardingCompleting,
            'transition-colors duration-700': $ui.animations,
            'transition-opacity opacity-100': $ui.animations && $app.onboardingCompleting,
        }"
    >
        <div class="flex relative z-10 justify-between items-center w-full max-w-content px-edge">
            <div class="relative flex-grow h-full">
                <transition
                    :enter-active-class="$ui.animations ? 'transition duration-700' : ''"
                    :enter-from-class="navigationButtonClasses.enterFrom"
                    enter-to-class="opacity-100"
                    :leave-active-class="$ui.animations ? 'transition duration-700' : ''"
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
                            aria-label="Umai"
                            class="flex ring-primary-100 justify-center items-center space-x-2 focus-visible:outline-none focus-visible:bg-primary-100 focus-visible:ring-8"
                        >
                            <i-app-umai class="mr-2 w-36 h-12 fill-primary-500" />
                        </router-link>
                    </div>
                    <div
                        v-else-if="navigationButton === 'back-arrow'"
                        class="flex absolute left-0 top-1/2 items-center -translate-y-1/2 w-full"
                    >
                        <CoreButton
                            clear
                            class="text-white text-left hover:bg-transparent focus:bg-transparent focus:ring-0 focus:ring-offset-0 focus-visible:bg-black/20 focus:hover:bg-transparent"
                            @click="goBack()"
                        >
                            <span aria-hidden="true" class="mr-2">&larr; </span>
                            <span>{{ backText }}</span>
                        </CoreButton>
                    </div>
                </transition>
            </div>
            <div v-if="!$viewer.active" class="flex space-x-2">
                <AppHeaderCloudStatus v-if="!$auth.dismissed" />
                <AppHeaderUserMenu />
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { debounce, value } from '@noeldemartin/utils';
import { watch } from 'vue';

import App from '@/framework/core/facades/App';
import Router from '@/framework/core/facades/Router';
import UI from '@/framework/core/facades/UI';
import { translate } from '@/framework/utils/translate';
import { useResizeObserver } from '@/framework/utils/composition/observers';

import Kitchen from '@/services/facades/Kitchen';
import Viewer from '@/services/facades/Viewer';

let navigationButtonClasses = $ref({ enterFrom: 'opacity-0', leaveTo: 'opacity-0' });
const $header = $ref<HTMLElement | null>(null);
const recipe = $computed(() => Viewer.recipe);
const list = $computed(() => recipe && recipe?.lists?.[0]);
const container = $computed(() => recipe && Viewer.getRecipeContainer(recipe));
const collection = $computed(() => list ?? container);
const navigationButton = $computed(() => {
    if (Viewer.active) {
        return Viewer.recipe && Viewer.hasSeenCollection ? 'back-arrow' : null;
    }

    if (Kitchen.active) {
        return Kitchen.lastPage?.showLogo ? 'logo' : 'back-arrow';
    }

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
const backText = $computed(() => {
    if (Date.now()) {
        return 'Noel De Martin\'s Public Recipes';
    }

    if (Viewer.active) {
        return collection?.name
            ?? Viewer.collection?.name
            ?? translate('viewer.collection.titleFallback');
    }

    return translate('menu.back');
});

async function goBack() {
    if (Viewer.active) {
        await Router.push({ name: 'viewer', query: { url: collection?.url } });

        return;
    }

    if (!Router.previousRouteWas('home')) {
        await Router.push({ name: 'home' });

        return;
    }

    Router.back();
}

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

useResizeObserver($$($header), debounce($header => UI.updateHeaderHeight($header.clientHeight), 50));
</script>
