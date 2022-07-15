<template>
    <div>
        <div class="flex flex-col md:flex-row">
            <CoreInput
                initial-focus
                class="z-10 flex-grow"
                :color="color"
                :name="name"
                :label="label"
                :show-errors="false"
                :placeholder="placeholder"
                :wobbly-border="$ui.isMobile ? {} : { topRight: false, bottomRight: false }"
            />
            <CoreButton
                type="submit"
                class="mt-2 focus:z-20 md:mt-0"
                alignment="center"
                :color="color"
                :wobbly-border="$ui.isMobile ? {} : { topLeft: false, bottomLeft: false }"
            >
                <slot />
            </CoreButton>
        </div>
        <CoreFormErrors class="mt-2" />
    </div>
</template>

<script setup lang="ts">
import { enumProp, requiredStringProp, stringProp } from '@/framework/utils/vue';

import { CoreColor } from '@/components/core';

defineProps({
    name: requiredStringProp(),
    color: enumProp(CoreColor),
    label: stringProp(),
    placeholder: stringProp(),
});
</script>
