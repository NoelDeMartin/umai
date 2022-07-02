<template>
    <div
        class="flex flex-row rounded-md shadow pointer-events-auto"
        :class="{
            'bg-white text-gray-900': isInfo,
            'bg-red-200 text-red-800': isError,
        }"
    >
        <div class="p-4">
            <slot />
        </div>
        <button
            v-for="(action, index) of actions"
            :key="index"
            type="button"
            class="p-4 text-white rounded-r-md focus:outline-none focus:ring-offset-2 focus:ring-2"
            :class="{
                'bg-primary-600 hover:bg-primary-700 focus:ring-primary-700': isInfo,
                'bg-red-500 hover:bg-red-600 focus:ring-red-600': isError,
            }"
            @click="action.handler"
        >
            {{ action.text }}
        </button>
    </div>
</template>

<script setup lang="ts">
import { arrayProp, enumProp } from '@/framework/utils/vue';
import { SnackbarStyle } from '@/framework/core/services/UIService';
import type { SnackbarAction } from '@/framework/core/services/UIService';

const { style } = defineProps({
    actions: arrayProp<SnackbarAction>(),
    style: enumProp(SnackbarStyle),
});

const isError = $computed(() => style === SnackbarStyle.Error);
const isInfo = $computed(() => style === SnackbarStyle.Info);
</script>
