<template>
    <div class="flex min-h-full flex-col items-center justify-center">
        <h1 id="home-title" class="sr-only">
            Umai
        </h1>

        <i-app-umai v-if="!$auth.ongoing" class="h-auto w-[250px] max-w-[60vw] fill-primary-500" aria-hidden="true" />

        <div class="mt-4 flex flex-col items-center justify-center">
            <HomeOnboardingCreateRecipe v-if="creatingNewRecipe" @cancel="creatingNewRecipe = false" />
            <HomeOnboardingLogin v-else-if="loggingIn" @cancel="loggingIn = false" />

            <template v-else>
                <div class="prose max-w-md text-center">
                    <p v-safe-html="welcomeMessage" />
                    <p>{{ $t('home.onboarding.getStarted') }}</p>
                </div>
                <div class="mt-2 flex flex-col items-end">
                    <CoreButton secondary class="w-full" @click="creatingNewRecipe = true">
                        <i-pepicons-knive-fork class="h-6 w-6" aria-hidden="true" />
                        <span class="ml-2">{{ $t('home.onboarding.createRecipe') }}</span>
                    </CoreButton>
                    <CoreButton
                        secondary
                        color="brand-solid"
                        class="group mt-2 w-full"
                        @click="loggingIn = true"
                    >
                        <i-app-solid-emblem
                            class="h-6 w-6 group-hover:text-brand-solid-500 group-focus:text-brand-solid-500"
                            aria-hidden="true"
                        />
                        <span class="ml-2">{{ $t('home.onboarding.loginWithSolid') }}</span>
                    </CoreButton>
                    <CoreLink
                        secondary
                        color="brand-solid"
                        class="mt-1.5 text-xs"
                        @click="
                            $ui.showMarkdown(
                                $t('home.onboarding.whatIsSolid_title'),
                                $t('home.onboarding.whatIsSolid_content')
                            )
                        "
                    >
                        {{ $t('home.onboarding.whatIsSolid') }}
                    </CoreLink>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { escapeHtmlEntities, stringTrimmed } from '@noeldemartin/utils';

import { translate } from '@/framework/utils/translate';

const creatingNewRecipe = $ref(false);
const loggingIn = $ref(false);
const welcomeMessage = $computed(() =>
    translate('home.onboarding.welcome', {
        umai: stringTrimmed(`
            <span
                class="font-semibold"
                title="${escapeHtmlEntities(translate('home.onboarding.umai_title'))}"
            >Umai</span>
        `),
    }));
</script>
