<template>
    <div class="relative">
        <transition
            :duration="300"
            @before-enter="showInput"
            @before-leave="hideInput"
        >
            <div v-if="active" class="absolute inset-y-0 right-0">
                <BaseFluidInput
                    ref="input"
                    type="text"
                    :placeholder="placeholder"
                    :model-value="modelValue"
                    @blur="active = !!modelValue"
                    @keyup.prevent.esc="clear"
                    @update:modelValue="$emit('update:modelValue', $event)"
                />
            </div>
        </transition>
        <transition
            :duration="300"
            @before-enter="showButton"
            @before-leave="hideButton"
        >
            <button
                v-if="!active"
                type="button"
                :aria-label="label"
                :title="label"
                :class="[
                    'absolute right-0 flex justify-center items-center rounded-full w-clickable h-clickable',
                    'hover:bg-black hover:bg-opacity-30',
                ]"
                @click="activate"
            >
                <i-zondicons-search class="w-4 h-4" />
            </button>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { after } from '@noeldemartin/utils';
import { nextTick } from 'vue';

import type IBaseFluidInput from '@/components/base/BaseFluidInput';

defineProps({
    modelValue: {
        type: String,
        required: true,
    },
    label: {
        type: String,
        required: true,
    },
    placeholder: {
        type: String,
        required: true,
    },
});
const emit = defineEmits(['update:modelValue']);

let active = $ref(false);
const input = $ref<IBaseFluidInput>();

async function activate() {
    active = true;

    await nextTick();

    input?.focus();
}

async function clear() {
    emit('update:modelValue', '');

    await nextTick();

    input?.blur();
}

async function showInput(element: Element) {
    (element as HTMLElement).style.opacity = '0';

    await nextTick();

    const minWidth = input?.minWidth;

    element.animate(
        [
            { opacity: 0 },
            { opacity: 1 },
        ],
        { duration: 150, fill: 'forwards' },
    );

    element.animate(
        [
            { width: 0 },
            { width: `${minWidth}px` },
        ],
        { duration: 300 },
    );
}

async function showButton(element: Element) {
    (element as HTMLElement).style.opacity = '0';

    await after({ milliseconds: 150 });

    element.animate(
        [
            { opacity: 0 },
            { opacity: 1 },
        ],
        { duration: 150, fill: 'forwards' },
    );
}

async function hideInput(element: Element) {
    element.animate(
        [
            { width: `${element.clientWidth}px` },
            { width: 0 },
        ],
        { duration: 300, fill: 'forwards' },
    );

    await after({ milliseconds: 150 });

    element.animate(
        [
            { opacity: 1 },
            { opacity: 0 },
        ],
        { duration: 150 },
    );
}

function hideButton(element: Element) {
    element.animate(
        [
            { opacity: 1 },
            { opacity: 0 },
        ],
        { duration: 150, fill: 'forwards' },
    );
}
</script>
