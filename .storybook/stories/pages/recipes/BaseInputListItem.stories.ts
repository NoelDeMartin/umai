import { meta, story, template } from '@sb/support/helpers';

import BaseInputListItem from '@/components/base/BaseInputListItem.vue';

interface Args {
    value: string;
}

const Template = template<Args>(({ value }) => {
    return {
        components: { BaseInputListItem },
        data: () => ({ value }),
        template: '<BaseInputListItem v-model="value" />',
    };
});

export const Playground = story(Template);

export default meta<Args>({
    component: BaseInputListItem,
    title: 'WIP/BaseInputListItem',
    args: {
        value: '300g Cheese',
    },
});
