<template>
    <!-- TODO story & styles -->
    <component
        :is="buttonComponent"
        v-bind="buttonProps"
        :class="[
            'inline-flex justify-center items-center px-4 py-2 rounded-md',
            'text-base font-medium whitespace-nowrap',
            isPrimary && 'border shadow-sm text-white bg-primary-600 border-transparent hover:bg-primary-700',
            isSecondary && 'border shadow-sm text-gray-700 bg-white border-gray-300 hover:bg-gray-50',
            isClear && 'text-gray-700 hover:bg-gray-200',
        ]"
    >
        <slot />
    </component>
</template>

<script setup lang="ts">
import { objectWithoutEmpty } from '@noeldemartin/utils';
import type { PropType } from 'vue';

const { route, routeParams, type, secondary, clear } = defineProps({
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
});

const isSecondary = $computed(() => secondary);
const isClear = $computed(() => clear);
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
