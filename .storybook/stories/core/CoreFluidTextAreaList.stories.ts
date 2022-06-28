import { meta, story } from '@sb/support/helpers';

import CoreFluidTextAreaList from '@/components/core/CoreFluidTextAreaList.vue';
import CoreListItemValue from '@/components/core/lists/CoreListItemValue';

const Meta = meta({
    component: CoreFluidTextAreaList,
    title: 'Core/Fluid TextArea List',
});

export default Meta;

export const Playground = story(() => ({
    components: { CoreFluidTextAreaList },
    data: () => ({
        items: [
            new CoreListItemValue([
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
                    'Donec nulla nisl, commodo fermentum auctor ac, rhoncus non dui.',
                'Suspendisse quam lorem, tincidunt a sem eu, porttitor facilisis libero. ' +
                    'Nulla nec mauris neque.',
                'Donec a mauris in tortor euismod facilisis. Aenean porta vel dolor eu porttitor',
            ].join('\n\n')),
            new CoreListItemValue,
        ],
    }),
    mounted() {
        this.$refs.$root.focus();
    },
    template: `
        <div class="w-full h-full p-8 overflow-scroll">
            <div class="prose mx-auto">
                <CoreFluidTextAreaList
                    ref="$root"
                    v-model="items"
                    add-label="Add Item"
                    item-placeholder="Write something..."
                    class="w-full"
                />
            </div>
        </div>
    `,
}));
