<template>
    <component :is="buttonComponent" ref="$root" v-bind="buttonProps">
        <slot />
    </component>
</template>

<script setup lang="ts">
import { objectWithoutEmpty } from '@noeldemartin/utils';
import type { LocationQuery, RouteLocation, RouteParams } from 'vue-router';

import { objectProp, stringProp } from '@/framework/utils/vue';
import { focusableElement } from '@/framework/components/headless';
import type { IFocusable } from '@/framework/components/headless';

const { route, routeParams, queryParams } = defineProps({
    route: stringProp(),
    routeParams: objectProp<RouteParams>(() => ({})),
    queryParams: objectProp<LocationQuery>(() => ({})),
});

const $root = $ref<HTMLElement | null>(null);
const buttonComponent = $computed(() => (route ? 'router-link' : 'button'));
const buttonProps = $computed(() =>
    buttonComponent === 'button'
        ? { type: 'button' }
        : {
            to: objectWithoutEmpty<Partial<RouteLocation>>({
                name: route,
                params: routeParams,
                query: queryParams,
            }),
        });

defineExpose<IFocusable>(focusableElement($$($root)));
</script>
