import { meta, story } from '@sb/support/helpers';

import CoreMarkdown from '@/components/core/CoreMarkdown.vue';

interface Args {
    text: string;
}

const Meta = meta<Args>({
    component: CoreMarkdown,
    title: 'Core/Markdown',
    args: {
        text: `
            ## Markdown content

            As you would expect, it supports **bold**, *italic*, and [links](/).

            Also lists:
             - one
             - two
             - three

            And even <CoreLink>custom links</CoreLink>.
        `
            .split('\n')
            .map(line => line.trim())
            .join('\n')
            .trim(),
    },
    argTypes: {
        text: { type: 'string' },
    },
});

export default Meta;

export const Playground = story<Args>((args) => ({
    components: { CoreMarkdown },
    data: () => args,
    template: '<CoreMarkdown :text="text" />',
}));
