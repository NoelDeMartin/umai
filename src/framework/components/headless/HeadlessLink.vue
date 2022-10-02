<template>
    <component
        :is="linkComponent"
        v-bind="linkProps[linkComponent]"
        :tabindex="a11y?.hidden.value ? -1 : undefined"
    >
        <slot />
    </component>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { objectWithoutEmpty } from '@noeldemartin/utils';
import type { LocationQuery, RouteLocation, RouteParams } from 'vue-router';

import { booleanProp, objectProp, stringProp } from '@/framework/utils/vue';
import type { A11y } from '@/framework/components/headless';

const { route, routeParams, routeQuery, url, internal } = defineProps({
    route: stringProp(),
    routeParams: objectProp<RouteParams>(() => ({})),
    routeQuery: objectProp<LocationQuery>(() => ({})),
    url: stringProp(),
    internal: booleanProp(),
});

const a11y = inject<A11y | null>('a11y', null);
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
            query: routeQuery,
        }),
    },
}));
</script>
