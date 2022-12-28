<template>
    <CoreDetails :summary="$t('cloud.advancedOptions')">
        <div v-for="option of options" :key="option.name" class="flex relative items-start py-1">
            <!-- TODO use CoreForm & CoreCheckbox -->
            <div class="flex items-center h-5">
                <input
                    :id="option.name"
                    v-model="option.enabled"
                    :name="option.name"
                    type="checkbox"
                    class="w-4 h-4 rounded border-gray-300 cursor-pointer form-checkbox text-brand-solid-600 focus:ring-brand-solid-500 hover:bg-gray-200"
                    @change="option.updated()"
                >
            </div>
            <div class="ml-3 w-full text-sm">
                <label :for="option.name" class="inline-flex items-baseline w-full font-medium text-gray-700 cursor-pointer">
                    <span v-if="!isConfigurable(option)">{{ option.text }}</span>
                    <!-- TODO review a11y -->
                    <template v-else>
                        <span>{{ option.text[0] }}</span>
                        &nbsp;
                        <CoreFluidInput
                            v-model="option.value"
                            color="brand-solid"
                            inline
                            type="number"
                            @change="option.updated()"
                        />
                        &nbsp;
                        <span>{{ option.text[1] }}</span>
                    </template>
                </label>
            </div>
        </div>
    </CoreDetails>
</template>

<script setup lang="ts">
import Auth from '@/framework/core/facades/Auth';
import Cloud from '@/framework/core/facades/Cloud';
import { translate } from '@/framework/utils/translate';

interface AuthOption {
    name: string;
    enabled: boolean;
    updated(): void;
}

interface BasicAuthOption extends AuthOption {
    text: string;
}

interface ConfigurableAuthOption extends AuthOption {
    text: [string, string];
    value: number;
}

const options: (BasicAuthOption | ConfigurableAuthOption)[] = $ref([
    {
        name: 'auto-reconnect',
        text: translate('cloud.reconnect_onStartup'),
        enabled: Auth.autoReconnect,
        updated() {
            Auth.autoReconnect = this.enabled;
        },
    },
    {
        name: 'startup-sync',
        text: translate('cloud.sync_onStartup'),
        enabled: Cloud.startupSync,
        updated() {
            Cloud.startupSync = this.enabled;
        },
    },
    {
        name: 'auto-sync',
        text: translate('cloud.sync_onInterval').split(' X ') as [string, string],
        enabled: !!Cloud.autoSync,
        value: Cloud.autoSync || 10,
        updated() {
            Cloud.autoSync = this.enabled ? this.value as number : false;
        },
    },
]);

function isConfigurable(option: AuthOption): option is ConfigurableAuthOption {
    return 'value' in option;
}
</script>
