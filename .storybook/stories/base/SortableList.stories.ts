import { meta, story, template } from '@sb/support/helpers';

import SortableList from '@/components/base/SortableList.vue';
import SortableListItem from '@/components/base/SortableListItem.vue';

interface Args {
    items: string[];
}

const Template = template<Args>(({ items }) => {
    return {
        components: { SortableList, SortableListItem },
        data: () => ({ items }),
        template: `
            <SortableList>
                <SortableListItem v-for="item of items" :key="item">
                    <span>{{ item }}</span>
                </SortableListItem>
            </SortableList>
        `,
    };
});

export const Playground = story(Template);

export default meta<Args>({
    component: SortableList,
    title: 'WIP/SortableList',
    args: {
        items: ['200g Chickpeas', '1tbsp Tahini', '2 Lemons', '1 Garlic Clove', 'EVOO', 'Parsley', 'S&P'],
    },
});
