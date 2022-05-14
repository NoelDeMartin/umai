import IconDelete from '~icons/pepicons/trash';
import IconEdit from '~icons/pepicons/pen';
import IconView from '~icons/pepicons/eye';
import { defineComponent, markRaw } from 'vue';

import { meta, story } from '@sb/support/helpers';

import AppButton from '@/components/base/AppButton.vue';
import { AppButtonColor } from '@/components/base/AppButton';

interface Args {
    text: string;
    icon: keyof typeof Icons;
    color: keyof typeof AppButtonColor;
    secondary: boolean;
    clear: boolean;
}

const Icons = {
    None: null,
    Edit: markRaw(IconEdit),
    Delete: markRaw(IconDelete),
    View: markRaw(IconView),
};

const Meta = meta<Args>({
    component: AppButton,
    title: 'AppButton',
    args: {
        text: 'Click me!',
        icon: 'None',
        color: 'Primary',
        secondary: false,
        clear: false,
    },
    argTypes: {
        text: { type: 'string' },
        icon: {
            control: { type: 'select' },
            options: Object.keys(Icons),
        },
        color: {
            control: { type: 'radio' },
            options: Object.keys(AppButtonColor),
        },
        secondary: { type: 'boolean' },
        clear: { type: 'boolean' },
    },
});

const UseCase = defineComponent({
    components: { AppButton },
    props: Object.keys(Meta.argTypes ?? Meta.args ?? {}),
    computed: {
        $args(): Args {
            return this.$props as unknown as Args;
        },
        iconComponent() {
            return Icons[this.$args.icon];
        },
        colorValue() {
            return AppButtonColor[this.$args.color];
        },
    },
    template: `
        <AppButton :color="colorValue" :secondary="secondary" :clear="clear">
            <component v-if="iconComponent" :is="iconComponent" />
            <span :class="iconComponent && 'ml-1'">{{ text }}</span>
        </AppButton>
    `,
});

export default Meta;

export const Playground = story<Args>(args => ({
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
