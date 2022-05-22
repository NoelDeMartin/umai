<template>
    <component :is="buttonComponent" v-bind="buttonProps">
        <slot />
    </component>
</template>

<script setup lang="ts">
import { objectWithoutEmpty } from '@noeldemartin/utils';
import type { LocationQuery, RouteLocation, RouteParams } from 'vue-router';

import { objectProp, stringProp } from '@/framework/utils/vue';

const { route, routeParams, queryParams } = defineProps({
    route: stringProp(),
    routeParams: objectProp<RouteParams>({}),
    queryParams: objectProp<LocationQuery>({}),
});

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
</script>
