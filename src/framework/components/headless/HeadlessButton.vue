<template>
    <component
        :is="component.tag"
        ref="$root"
        v-bind="component.props"
    >
        <slot />
    </component>
</template>

<script setup lang="ts">
import { objectWithoutEmpty } from '@noeldemartin/utils';
import type { LocationQuery, RouteLocation, RouteParams } from 'vue-router';

import { objectProp, stringProp } from '@/framework/utils/vue';
import { focusableElement } from '@/framework/components/headless';
import type { IFocusable } from '@/framework/components/headless';

const { url, route, routeParams, routeQuery } = defineProps({
    url: stringProp(),
    route: stringProp(),
    routeParams: objectProp<RouteParams>(() => ({})),
    routeQuery: objectProp<LocationQuery>(() => ({})),
});

const $root = $ref<HTMLElement | null>(null);
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
