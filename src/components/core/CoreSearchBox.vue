<template>
    <div ref="$root" class="relative" role="searchbox">
        <transition
            :duration="300"
            @before-enter="(element: Element) => showInput(element as HTMLElement)"
            @before-leave="(element: Element) => hideInput(element as HTMLElement)"
        >
            <div v-if="active" class="absolute right-0 overflow-hidden">
                <CoreFluidInput
                    ref="$input"
                    type="search"
                    :placeholder="placeholder"
                    :model-value="modelValue"
                    @blur="active = !!modelValue, $emit('blur')"
                    @focus="$emit('focus')"
                    @keyup.prevent.esc="clear"
                    @update:modelValue="$emit('update:modelValue', $event)"
                />
            </div>
        </transition>
        <transition
            :duration="300"
            @before-enter="(element: Element) => showButton(element as HTMLElement)"
            @before-leave="(element: Element) => hideButton(element as HTMLElement)"
        >
            <CoreButton
                v-if="!active"
                ref="$button"
                clear
                :aria-label="label"
                :title="label"
                @click="activate"
            >
                <i-pepicons-loop class="w-6 h-6" />
            </CoreButton>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { nextTick } from 'vue';

import { afterAnimationTime, animateElement } from '@/framework/utils/dom';
import { requiredStringProp, stringProp } from '@/framework/utils/vue';
import type { IFocusable } from '@/framework/components/headless';

import type ICoreFluidInput from '@/components/core/CoreFluidInput';

defineProps({
    modelValue: requiredStringProp(),
    label: stringProp('Search'),
    placeholder: stringProp('Search...'),
});
const emit = defineEmits(['update:modelValue', 'focus', 'blur']);

let active = $ref(false);
const $root = $ref<HTMLElement | null>(null);
const $input = $ref<ICoreFluidInput | null>(null);
const $button = $ref<IFocusable | null>(null);

async function activate() {
    active = true;

    await nextTick();

    $input?.focus();
}

async function clear() {
    emit('update:modelValue', '');

    await nextTick();

    $input?.blur();
}

async function showInput($element: HTMLElement) {
    const height = $button?.getRootElement()?.clientHeight;

    $root && ($root.style.height = `${height}px`);
    $element.classList.add('opacity-0');

    await nextTick();

    const minWidth = $input?.minWidth;

    await Promise.all([
        animateElement($element, {
            duration: 150,
            after: { removeClasses: 'opacity-0' },
            styles: {
                opacity: ['0', '1'],
            },
        }),
        animateElement($element, {
            duration: 300,
            styles: {
                width: ['0', `${minWidth}px`],
            },
        }),
    ]);
}

async function showButton($element: HTMLElement) {
    $element.classList.add('opacity-0');

    await afterAnimationTime(150);
    await animateElement($element, {
        duration: 150,
        after: { removeClasses: 'opacity-0' },
        styles: {
            opacity: ['0', '1'],
        },
    });
}

async function hideInput($element: HTMLElement) {
    await Promise.all([
        animateElement($element, {
            duration: 300,
            styles: {
                width: [`${$element.clientWidth}px`, '0'],
            },
        }),
        afterAnimationTime(150)
            .then(() => animateElement($element, {
                duration: 150,
                styles: {
                    opacity: ['1', '0'],
                },
            })),
    ]);
}

async function hideButton($element: HTMLElement) {
    await animateElement($element, {
        duration: 150,
        after: { addClasses: 'opacity-0' },
        styles: {
            opacity: ['1', '0'],
        },
    });
}
</script>
