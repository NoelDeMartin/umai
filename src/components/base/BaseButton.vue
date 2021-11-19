<template>
    <!-- TODO story & styles -->
    <component
        :is="buttonComponent"
        v-bind="buttonProps"
        :class="[
            'inline-flex justify-center items-center px-4 py-2 rounded-md border shadow-sm',
            'text-base font-medium whitespace-nowrap',
            isPrimary && 'text-white bg-primary-600 border-transparent hover:bg-primary-700',
            isSecondary && 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50',
        ]"
    >
        <slot />
    </component>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue';
import type { PropType } from 'vue';

const props = defineProps({
    route: {
        type: String,
        default: null,
    },
    routeParams: {
        type: Object as PropType<Object | null>,
        default: null,
    },
    secondary: {
        type: Boolean,
        default: false,
    },
});

const isPrimary = computed(() => !props.secondary);
const isSecondary = computed(() => props.secondary);
const buttonComponent = computed(() => props.route ? 'router-link' : 'button');
const buttonProps = computed(() => {
    if (buttonComponent.value === 'button') {
        return { type: 'button' };
    }

    const routeData: { name: string; params?: Object } = { name: props.route };

    if (props.routeParams)
        routeData.params = props.routeParams;

    return { to: routeData };
});
</script>
