<template>
    <!-- TODO story & styles -->
    <component
        :is="linkComponent"
        v-bind="linkProps[linkComponent]"
        class="text-primary-600 hover:text-primary-500 hover:underline"
    >
        <slot />
    </component>
</template>

<script setup lang="ts">
import { objectWithoutEmpty } from '@noeldemartin/utils';
import { computed } from 'vue';
import type { PropType } from 'vue';

const { route, routeParams, url } = defineProps({
    route: {
        type: String as PropType<string | null>,
        default: null,
    },
    routeParams: {
        type: Object as PropType<Object | null>,
        default: null,
    },
    url: {
        type: String as PropType<string | null>,
        default: null,
    },
});

const linkComponent = computed(() =>
    route ? 'router-link' : url ? 'a' : 'button');
const linkProps = computed(() => ({
    'a': {
        href: url,
        target: '_blank',
    },
    'button': {
        type: 'button',
    },
    'router-link': {
        to: objectWithoutEmpty({
            name: route,
            params: routeParams,
        }),
    },
}));
</script>
