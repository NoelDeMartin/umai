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
import { computed } from 'vue';
import type { PropType } from 'vue';
import { objectWithoutEmpty } from '@noeldemartin/utils';

const props = defineProps({
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

const linkComponent = computed(() => props.route ? 'router-link' : (props.url ? 'a' : 'button'));
const linkProps = computed(() => ({
    'a': {
        href: props.url,
        target: '_blank',
    },
    'button': {
        type: 'button',
    },
    'router-link': {
        to: objectWithoutEmpty({
            name: props.route,
            params: props.routeParams,
        }),
    },
}));
</script>
