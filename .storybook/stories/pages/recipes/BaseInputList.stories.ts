import { uuid } from '@noeldemartin/utils';

import { meta, story, template } from '@sb/support/helpers';

import BaseInputList from '@/components/base/BaseInputList.vue';
import type { BaseInputListItemData } from '@/components/base/BaseInputListItem';

interface Args {
    value: string[];
}

const Template = template<Args>(({ value }) => {
    const ingredients: BaseInputListItemData[] = value.map(value => ({ id: uuid(), value }));

    return {
        components: { BaseInputList },
        data: () => ({ ingredients }),
        template: '<BaseInputList v-model="ingredients" />',
    };
});

export const Playground = story(Template);

export default meta<Args>({
    component: BaseInputList,
    title: 'WIP/BaseInputList',
    args: {
        value: [
            //
            '200g Chickpeas',
            '1tbsp Tahini',
            '2 Lemons',
            '1 Garlic Clove',
            'EVOO',
            'Parsley',
            'S&P',
        ],
    },
});
