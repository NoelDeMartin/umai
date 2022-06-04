import { defineComponent } from 'vue';

import { meta, story } from '@sb/support/helpers';

import CoreFluidTextarea from '@/components/core/CoreFluidTextarea.vue';

interface Args {
    value: string;
    placeholder: string;
    error: string;
}

const Meta = meta<Args>({
    component: CoreFluidTextarea,
    title: 'Core/Fluid Textarea',
    args: {
        value: [
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            'Ut vitae magna sed turpis fringilla tempor vel nec libero.',
            'Vivamus mi ante, finibus porta maximus at, cursus non ligula.',
        ].join('\n\n'),
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
    components: { CoreFluidTextarea },
    emits: ['update:modelValue'],
    props: Object.keys(Meta.argTypes ?? Meta.args ?? {}),
    template: `
        <CoreFluidTextarea
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
