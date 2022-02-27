<template>
    <!-- TODO story & styles -->
    <component
        :is="buttonComponent"
        :disabled="isDisabled || null"
        v-bind="buttonProps"
        :class="[
            'inline-flex justify-center items-center px-4 py-2 rounded-md',
            'text-base font-medium whitespace-nowrap',
            isPrimary && 'border shadow-sm text-white bg-primary-600 border-transparent',
            isSecondary && 'border shadow-sm text-gray-700 bg-white border-gray-300',
            isClear && 'text-gray-700',
            ...(
                isDisabled
                    ? ['opacity-50']
                    : [
                        isPrimary && 'hover:bg-primary-700',
                        isSecondary && 'hover:bg-gray-50',
                        isClear && 'hover:bg-gray-200',
                    ]
            ),
        ]"
    >
        <slot />
    </component>
</template>

<script setup lang="ts">
import { objectWithoutEmpty } from '@noeldemartin/utils';
import type { PropType } from 'vue';

const { route, routeParams, type, secondary, clear, disabled } = defineProps({
    route: {
        type: String as PropType<string | null>,
        default: null,
    },
    routeParams: {
        type: Object as PropType<Object | null>,
        default: null,
    },
    type: {
        type: String,
        default: 'button',
    },
    secondary: {
        type: Boolean,
        default: false,
    },
    clear: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});

const isSecondary = $computed(() => secondary);
const isClear = $computed(() => clear);
const isDisabled = $computed(() => disabled);
const isPrimary = $computed(() => !secondary && !clear);
const buttonComponent = $computed(() => route ? 'router-link' : 'button');
const buttonProps = $computed(
    () => buttonComponent === 'button'
        ? { type }
        : {
            to: objectWithoutEmpty({
                name: route,
                params: routeParams,
            }),
        },
);
</script>
