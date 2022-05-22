import { tap } from '@noeldemartin/utils';

// TODO import these from tailwind config
const config = {
    spacing: {
        edge: '2rem',
        content: '1280px',
    },
    fontSizes: {
        '4xl': '2.5rem',
    },
};

const memoizedPixels: Record<string, number> = {};

function measurePixels(css: string): number {
    if (/\d+px/.test(css)) return parseInt(css.slice(0, -2));

    const ruler = document.createElement('div');
    ruler.style.position = 'fixed';
    ruler.style.width = css;

    document.body.append(ruler);

    return tap(ruler.clientWidth, () => ruler.remove());
}

export default {
    css(key: string): string {
        if (/^spacing\.\d+$/.test(key)) return parseInt(key.substring(8)) * 0.25 + 'rem';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = key.split('.').reduce((value, part) => value?.[part], config as any);

        return typeof value === 'string' ? value : '0px';
    },
    pixels(key: string): number {
        return (memoizedPixels[key] ??= measurePixels(this.css(key)));
    },
};
