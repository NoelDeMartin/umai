import { meta, story } from '@sb/support/helpers';

import CoreFluidInputList from '@/components/core/CoreFluidInputList.vue';
import { CoreListItemValue } from '@/components/core';

const Meta = meta({
    component: CoreFluidInputList,
    title: 'Core/Fluid Input List',
});

export default Meta;

export const Playground = story(() => ({
    components: { CoreFluidInputList },
    data: () => ({
        items: [
            new CoreListItemValue('Item #1'),
            new CoreListItemValue('Item #2'),
            new CoreListItemValue,
        ],
    }),
    mounted() {
        this.$refs.$root.focus();
    },
    template: `
        <CoreFluidInputList
            ref="$root"
            v-model="items"
            add-label="Add Item"
            item-placeholder="Write something..."
        />
    `,
}));
