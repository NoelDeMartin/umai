<template>
    <!-- TODO story & styles -->
    <component
        :is="buttonComponent"
        v-bind="buttonProps"
        class="inline-flex justify-center items-center px-4 py-2 text-base font-medium text-white whitespace-nowrap bg-origin-border bg-gradient-to-r from-purple-600 to-indigo-600 rounded-md border border-transparent shadow-sm hover:from-purple-700 hover:to-indigo-700"
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
});

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
