<template>
    <component :is="buttonComponent" v-bind="buttonProps">
        <slot />
    </component>
</template>

<script setup lang="ts">
import { objectWithoutEmpty } from '@noeldemartin/utils';
import type { PropType } from 'vue';

const { route, routeParams } = defineProps({
    route: {
        type: String as PropType<string | null>,
        default: null,
    },
    routeParams: {
        type: Object as PropType<Object | null>,
        default: null,
    },
});

const buttonComponent = $computed(() => (route ? 'router-link' : 'button'));
const buttonProps = $computed(() =>
    buttonComponent === 'button'
        ? { type: 'button' }
        : {
            to: objectWithoutEmpty({
                name: route,
                params: routeParams,
            }),
        });
</script>
