<template>
    <component :is="linkComponent" v-bind="linkProps[linkComponent]">
        <slot />
    </component>
</template>

<script setup lang="ts">
import { objectWithoutEmpty } from '@noeldemartin/utils';
import type { RouteLocation, RouteParams } from 'vue-router';

import { booleanProp, objectProp, stringProp } from '@/framework/utils/vue';

const { route, routeParams, url, internal } = defineProps({
    route: stringProp(),
    routeParams: objectProp<RouteParams>({}),
    url: stringProp(),
    internal: booleanProp(),
});

const linkComponent: keyof typeof linkProps = $computed(() => (route ? 'router-link' : url ? 'a' : 'button'));
const linkProps = $computed(() => ({
    'a': {
        href: url,
        target: internal ? null : '_blank',
    },
    'button': { type: 'button' },
    'router-link': {
        to: objectWithoutEmpty<Partial<RouteLocation>>({
            name: route,
            params: routeParams,
        }),
    },
}));
</script>
