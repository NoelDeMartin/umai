import { meta, story, template } from '@sb/support/helpers';

import BaseInput from '@/components/base/BaseInput.vue';

interface Args {
    value: string;
}

const Template = template<Args>(({ value }) => {
    return {
        components: { BaseInput },
        data: () => ({ value }),
        template: '<BaseInput v-model="value" />',
    };
});

export const Showcase = story(template<Args>(({ value }) => ({
    components: { BaseInput },
    data: () => ({ value }),
    template: `
        <div>
            <h2 class="mb-2 font-semibold text-center">Default</h2>
            <div class="w-80"><BaseInput class="w-full" v-model="value" /></div>
        </div>

        <div>
            <h2 class="mb-2 font-semibold text-center">Focused</h2>
            <div class="w-80"><BaseInput class="w-full" v-model="value" class=":focus" /></div>
        </div>

        <div>
            <h2 class="mb-2 font-semibold text-center">Error</h2>
            <div class="w-80"><BaseInput class="w-full" v-model="value" error="Something is not right" /></div>
        </div>
    `,
})));

export const Playground = story(Template);

export default meta<Args>({
    component: BaseInput,
    title: 'WIP/BaseInput',
    args: { value: 'Foo bar' },
});
