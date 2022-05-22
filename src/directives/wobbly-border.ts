import { randomInt, range } from '@noeldemartin/utils';

import { defineDirective } from '@/framework/utils/vue';

function randomBorderRadius(corner: Corner, options: WobblyBorderOptions): string {
    const { min, max, ...corners } = options;

    return corners[corner] ? `${randomInt(min, max)}px` : '0';
}

export const sortedCorners = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'] as const;

export type Corner = typeof sortedCorners[number];

export type WobblyBorderOptions = Record<Corner, boolean> & {
    min: number;
    max: number;
};

export function randomWobblyBorderRadius(options: Partial<WobblyBorderOptions> = {}): string {
    const fullOptions = {
        min: 50,
        max: 150,
        topLeft: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        ...options,
    };

    return range(2)
        .map(() => sortedCorners.map(corner => randomBorderRadius(corner, fullOptions)).join(' '))
        .join(' / ');
}

export default defineDirective({
    mounted(element: HTMLElement, { value }) {
        if (value === false) return;
        if (value === true || !value) value = {};

        element.style.borderRadius = randomWobblyBorderRadius(value);
    },
});
