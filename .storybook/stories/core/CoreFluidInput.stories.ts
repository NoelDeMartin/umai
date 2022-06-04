import { defineComponent } from 'vue';

import { meta, story } from '@sb/support/helpers';

import CoreFluidInput from '@/components/core/CoreFluidInput.vue';

interface Args {
    value: string;
    placeholder: string;
    error: string;
}

const Meta = meta<Args>({
    component: CoreFluidInput,
    title: 'Core/Fluid Input',
    args: {
        value: 'john@example.com',
        placeholder: 'Enter text...',
        error: '',
    },
    argTypes: {
        value: { type: 'string' },
        placeholder: { type: 'string' },
        error: { type: 'string' },
    },
});

const UseCase = defineComponent({
    components: { CoreFluidInput },
    emits: ['update:modelValue'],
    props: Object.keys(Meta.argTypes ?? Meta.args ?? {}),
    template: `
        <CoreFluidInput
            :placeholder="placeholder"
            :error="error"
            :modelValue="value"
        @update:modelValue="$emit('update:modelValue', $event)"
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
            <h2 class="font-semibold">Hover</h2>
            <UseCase class=":hover mt-2" v-bind="otherArgs" v-model="value" />
        </div>
        <div class="text-center">
            <h2 class="font-semibold">Focus</h2>
            <UseCase class=":focus mt-2" v-bind="otherArgs" v-model="value" />
        </div>
    `,
}));
