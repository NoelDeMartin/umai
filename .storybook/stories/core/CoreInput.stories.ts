import { defineComponent } from 'vue';

import { meta, story } from '@sb/support/helpers';

import CoreInput from '@/components/core/CoreInput.vue';
import { CoreColor } from '@/components/core/constants';

interface Args {
    value: string;
    placeholder: string;
    error: string;
    color: keyof typeof CoreColor;
}

const Meta = meta<Args>({
    component: CoreInput,
    title: 'Core/Input',
    args: {
        value: 'john@example.com',
        placeholder: 'Enter text...',
        error: '',
        color: 'Primary',
    },
    argTypes: {
        value: { type: 'string' },
        placeholder: { type: 'string' },
        error: { type: 'string' },
        color: {
            control: { type: 'radio' },
            options: Object.keys(CoreColor),
        },
    },
});

const UseCase = defineComponent({
    components: { CoreInput },
    emits: ['update:modelValue'],
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
        <CoreInput
            :placeholder="placeholder"
            :error="error"
            :color="colorValue"
            :modelValue="value"
            @update:modelValue="value => $emit('update:modelValue', value)"
        />
    `,
});

export default Meta;

export const Playground = story<Args>((args) => ({
    components: { UseCase },
    data() {
        const { value, ...otherArgs } = args;
        return {
            value,
            otherArgs,
        };
    },
    template: `
        <div class="text-center">
            <h2 class="font-semibold">Default</h2>
            <UseCase class="mt-2" v-bind="otherArgs" v-model="value" />
        </div>
        <div class="text-center">
            <h2 class="font-semibold">Focus</h2>
            <UseCase class=":focus mt-2" v-bind="otherArgs" v-model="value" />
        </div>
    `,
}));
