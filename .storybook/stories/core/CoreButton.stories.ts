import IconDelete from '~icons/pepicons/trash';
import IconEdit from '~icons/pepicons/pen';
import IconView from '~icons/pepicons/eye';
import { defineComponent, markRaw } from 'vue';

import { meta, story } from '@sb/support/helpers';

import CoreButton from '@/components/core/CoreButton.vue';
import { CoreAlignment, CoreColor } from '@/components/core/constants';

interface Args {
    text: string;
    icon: keyof typeof Icons;
    color: keyof typeof CoreColor;
    alignment: keyof typeof CoreAlignment;
    secondary: boolean;
    clear: boolean;
    width: string;
}

const Icons = {
    None: null,
    Edit: markRaw(IconEdit),
    Delete: markRaw(IconDelete),
    View: markRaw(IconView),
};

const Meta = meta<Args>({
    component: CoreButton,
    title: 'Core/Button',
    args: {
        text: 'Click me!',
        icon: 'None',
        color: 'Primary',
        alignment: 'Start',
        secondary: false,
        clear: false,
        width: '',
    },
    argTypes: {
        text: { type: 'string' },
        icon: {
            control: { type: 'select' },
            options: Object.keys(Icons),
        },
        color: {
            control: { type: 'radio' },
            options: Object.keys(CoreColor),
        },
        alignment: {
            control: { type: 'radio' },
            options: Object.keys(CoreAlignment),
        },
        secondary: { type: 'boolean' },
        clear: { type: 'boolean' },
        width: { type: 'string' },
    },
});

const UseCase = defineComponent({
    components: { CoreButton },
    props: Object.keys(Meta.argTypes ?? Meta.args ?? {}),
    computed: {
        $args(): Args {
            return this.$props as unknown as Args;
        },
        iconComponent() {
            return Icons[this.$args.icon];
        },
        colorValue() {
            return CoreColor[this.$args.color];
        },
        alignmentValue() {
            return CoreAlignment[this.$args.alignment];
        },
    },
    template: `
        <CoreButton
            :color="colorValue"
            :alignment="alignmentValue"
            :secondary="secondary"
            :clear="clear"
            :style="width && ('width:' + width + 'px')"
        >
            <component v-if="iconComponent" :is="iconComponent" />
            <span :class="iconComponent && 'ml-1'">{{ text }}</span>
        </CoreButton>
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
            <h2 class="font-semibold">Focus</h2>
            <UseCase class=":focus mt-2" v-bind="$data" />
        </div>
        <div class="text-center">
            <h2 class="font-semibold">Focus + Hover</h2>
            <UseCase class=":focus :hover mt-2" v-bind="$data" />
        </div>
    `,
}));
