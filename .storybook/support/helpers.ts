import { tap } from '@noeldemartin/utils';
import type { Meta, Story } from '@storybook/vue3/types-6-0';

export function meta<Args>(meta: Meta<Args>): Meta<Args> {
    return meta;
}

export function story<Args>(template: Story<Args>, args: Partial<Args> = {}): Story<Args> {
    return tap(template.bind({}), story => {
        story.args = args;
    });
}

export function template<Args>(story: Story<Args>): Story<Args> {
    return story;
}
