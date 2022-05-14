import { randomInt, range } from '@noeldemartin/utils';

import { defineDirective } from '@/framework/utils/vue';

export default defineDirective({
    mounted(element: HTMLElement, { value }) {
        const [min, max] = value ?? [50, 150];

        element.style.borderRadius = range(2).map(
            () => range(4).map(() => `${randomInt(min, max)}px`).join(' '),
        ).join(' / ');
    },
});
