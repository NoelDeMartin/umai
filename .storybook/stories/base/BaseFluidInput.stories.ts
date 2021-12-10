import { meta, story, template } from '@sb/support/helpers';

import BaseFluidInput from '@/components/base/BaseFluidInput.vue';

interface Args {
    value: string;
}

const Template = template<Args>(({ value }) => {
    return {
        data: () => ({ value }),
        components: { BaseFluidInput },
        template: '<BaseFluidInput v-model="value" placeholder="Placeholder text" />',
    };
});

export const Playground = story(Template);

export default meta<Args>({
    component: BaseFluidInput,
    title: 'BaseFluidInput',
    args: {
        value: 'Foobar',
    },
});
