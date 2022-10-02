<template>
    <component
        :is="component.tag"
        ref="$root"
        v-bind="component.props"
        :tabindex="a11y?.hidden.value ? -1 : undefined"
    >
        <slot />
    </component>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { objectWithoutEmpty } from '@noeldemartin/utils';
import type { LocationQuery, RouteLocation, RouteParams } from 'vue-router';

import { objectProp, stringProp } from '@/framework/utils/vue';
import { focusableElement } from '@/framework/components/headless';
import type { A11y, IFocusable } from '@/framework/components/headless';

const { url, route, routeParams, routeQuery } = defineProps({
    url: stringProp(),
    route: stringProp(),
    routeParams: objectProp<RouteParams>(() => ({})),
    routeQuery: objectProp<LocationQuery>(() => ({})),
});

const $root = $ref<HTMLElement | null>(null);
const a11y = inject<A11y | null>('a11y', null);
const component = $computed(() => {
    if (route) {
        return {
            tag: 'router-link',
            props: {
                to: objectWithoutEmpty<Partial<RouteLocation>>({
                    name: route,
                    params: routeParams,
                    query: routeQuery,
                }),
            },
        };
    }

    if (url) {
        return {
            tag: 'a',
            props: {
                target: '_blank',
                href: url,
            },
        };
    }

    return {
        tag: 'button',
        props: { type: 'button' },
    };
});

defineExpose<IFocusable>(focusableElement($$($root)));
</script>
