<template>
    <SwitchGroup as="div" class="flex flex-col justify-between">
        <div class="flex justify-between items-center">
            <SwitchLabel
                v-if="label"
                as="div"
                class="font-medium text-gray-900"
                passive
            >
                {{ label }}
            </SwitchLabel>
            <Switch
                class="
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
                    transition-colors duration-200 ease-in-out ml-2
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                "
                :class="modelValue ? 'bg-primary-600' : 'bg-gray-200'"
                :model-value="modelValue"
                @update:modelValue="$emit('update:modelValue', $event)"
            >
                <span
                    aria-hidden="true"
                    class="
                        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
                        transition duration-200 ease-in-out
                    "
                    :class="modelValue ? 'translate-x-5' : 'translate-x-0'"
                />
            </Switch>
        </div>
        <SwitchDescription v-if="description" as="span" class="mt-2 max-w-prose">
            <CoreMarkdown :text="description" class="text-sm text-gray-500" />
        </SwitchDescription>
    </SwitchGroup>
</template>

<script setup lang="ts">
import { booleanProp, stringProp } from '@/framework/utils/vue';

defineProps({
    label: stringProp(),
    description: stringProp(),
    modelValue: booleanProp(),
});
defineEmits(['update:modelValue']);
</script>
