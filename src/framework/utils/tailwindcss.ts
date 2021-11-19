import { tap } from '@noeldemartin/utils';

// TODO import these from tailwind config
const config = {
    spacing: {
        1: '.25rem',
        2: '.5rem',
        4: '1rem',
        edge: '2rem',
        content: '1280px',
    },
};

const memoizedPixels: Record<string, number> = {};

function measurePixels(css: string): number {
    if (/\d+px/.test(css))
        return parseInt(css.slice(0, -2));

    const ruler = document.createElement('div');
    ruler.style.position = 'fixed';
    ruler.style.width = css;

    document.body.append(ruler);

    return tap(ruler.clientWidth, () => ruler.remove());
}

export default {
    css(key: string): string {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = key.split('.').reduce((value, part) => value?.[part], config as any);

        return typeof value === 'string' ? value : '0px';
    },
    pixels(key: string): number {
        memoizedPixels[key] ??= measurePixels(this.css(key));

        return memoizedPixels[key];
    },
};
