<template>
    <div class="flex flex-col flex-grow items-center justify-center">
        <h1 id="home-title" class="sr-only">
            Umai
        </h1>

        <i-app-umai-xmas v-if="!$auth.ongoing" class="h-auto w-[250px] max-w-[60vw] fill-primary-500" aria-hidden="true" />

        <div class="mt-4 flex flex-col items-center justify-center">
            <HomeOnboardingCreateRecipe v-if="creatingNewRecipe" @cancel="creatingNewRecipe = false" />
            <HomeOnboardingLogin v-else-if="loggingIn" @cancel="loggingIn = false" />

            <template v-else>
                <div class="prose max-w-md text-center">
                    <p>
                        <span v-safe-html="welcomeMessage.beforeTooltip" />
                        <CoreTooltip
                            v-slot="{ tooltipId, openTooltip, closeTooltip }"
                            :text="$t('home.onboarding.umai_title')"
                        >
                            <CoreLink
                                :aria-describedby="tooltipId"
                                url="/"
                                internal
                                secondary
                                class="no-underline font-semibold hover:!text-gray-700"
                                @click.prevent
                                @focus="openTooltip()"
                                @blur="closeTooltip()"
                            >
                                Umai
                            </CoreLink>
                        </CoreTooltip>
                        <span v-safe-html="welcomeMessage.afterTooltip" />
                    </p>
                    <p>{{ $t('home.onboarding.getStarted') }}</p>
                </div>
                <div class="mt-2 flex flex-col items-center">
                    <CoreButton
                        secondary
                        tinted
                        class="w-full"
                        @click="creatingNewRecipe = true"
                    >
                        <i-pepicons-knive-fork class="h-6 w-6" aria-hidden="true" />
                        <span class="ml-2">{{ $t('home.onboarding.createRecipe') }}</span>
                    </CoreButton>
                    <CoreButton
                        secondary
                        tinted
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
import { translate } from '@/framework/utils/translate';
import { useRouteState } from '@/framework/utils/vue';

const loggingIn = $(useRouteState('loggingIn', false));
const creatingNewRecipe = $(useRouteState('creatingNewRecipe', false));
const welcomeMessage = $computed(() => {
    const text = translate('home.onboarding.welcome', { umai: '%SEPARATOR%' });
    const [beforeTooltip, afterTooltip] = text.split('%SEPARATOR%');

    return {
        beforeTooltip: beforeTooltip?.replace(/\s+$/, '&nbsp;'),
        afterTooltip: afterTooltip?.replace(/^\s+/, '&nbsp;'),
    };
});
</script>
