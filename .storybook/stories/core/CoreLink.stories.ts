import { defineComponent } from 'vue';

import { meta, story } from '@sb/support/helpers';

import CoreLink from '@/components/core/CoreLink.vue';
import { CoreColor } from '@/components/core';

interface Args {
    text: string;
    color: keyof typeof CoreColor;
    secondary: boolean;
}

const Meta = meta<Args>({
    component: CoreLink,
    title: 'Core/Link',
    args: {
        text: 'Click me!',
        color: 'Primary',
        secondary: false,
    },
    argTypes: {
        text: { type: 'string' },
        color: {
            control: { type: 'radio' },
            options: Object.keys(CoreColor),
        },
        secondary: { type: 'boolean' },
    },
});

const UseCase = defineComponent({
    components: { CoreLink },
    props: Object.keys(Meta.argTypes ?? Meta.args ?? {}),
    computed: {
        $args(): Args {
            return this.$props as unknown as Args;
        },
        colorValue() {
            return CoreColor[this.$args.color];
        },
    },
    template: `
        <CoreLink :color="colorValue" :secondary="secondary">
            {{ text }}</span>
        </CoreLink>
    `,
});

export default Meta;

export const Playground = story<Args>((args) => ({
    components: { UseCase },
    data: () => args,
    template: `
        <div class="text-center">
            <h2 class="font-semibold">Default</h2>
            <UseCase class="mt-2" v-bind="$data" />
        </div>
        <div class="text-center">
            <h2 class="font-semibold">Hover</h2>
            <UseCase class=":hover mt-2" v-bind="$data" />
        </div>
        <div class="text-center">
            <h2 class="font-semibold">Focus Visible</h2>
            <UseCase class=":focus-visible mt-2" v-bind="$data" />
        </div>
        <div class="text-center">
            <h2 class="font-semibold">Focus Visible + Hover</h2>
            <UseCase class=":focus-visible :hover mt-2" v-bind="$data" />
        </div>
    `,
}));
