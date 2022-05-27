import { meta, story } from '@sb/support/helpers';

import CoreButton from '@/components/core/CoreButton.vue';
import CoreTooltip from '@/components/core/CoreTooltip.vue';

interface Args {
    text: string;
}

const Meta = meta<Args>({
    component: CoreTooltip,
    title: 'Core/Tooltip',
    args: {
        text: 'Something interesting about this button',
    },
    argTypes: {
        text: { type: 'string' },
    },
});

export default Meta;

export const Playground = story<Args>((args) => ({
    components: {
        CoreTooltip,
        CoreButton,
    },
    data: () => args,
    template: `
        <CoreTooltip :text="text" v-slot="{ tooltipId, openTooltip, closeTooltip }">
            <CoreButton
                :aria-describedby="tooltipId"
                @focus="openTooltip()"
                @blur="closeTooltip()"
            >
                Hover me!
            </CoreButton>
        </CoreTooltip>
    `,
}));
