import { tap } from '@noeldemartin/utils';

// TODO import these from tailwind config
const config = {
    colors: {
        gray: {
            50: '#fafafa',
            100: '#f5f5f5',
            200: '#e5e5e5',
            300: '#d4d4d4',
            400: '#a3a3a3',
            500: '#737373',
            600: '#525252',
            700: '#404040',
            800: '#262626',
            900: '#171717',
        },
        primary: {
            100: '#dff29c',
            200: '#d5ee7c',
            300: '#c0e147',
            400: '#b0d237',
            500: '#8db007',
            600: '#738e06',
            700: '#668104',
            800: '#637a05',
            900: '#475809',
        },
    },
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
    if (/\d+px/.test(css))
        return parseInt(css.slice(0, -2));

    const ruler = document.createElement('div');
    ruler.style.position = 'fixed';
    ruler.style.width = css;

    document.body.append(ruler);

    return tap(ruler.clientWidth, () => ruler.remove());
}

function classifyClasses(classes: string[]): Record<string, string[]> {
    return classes.reduce((classified, className) => {
        const group = className.match(
            /((hover|focus):)*(px-|text-(xs|md|lg|(\d)*xl)|text-|bg-|ring-offset-(\d)+|ring-offset-|ring-(\d)+|ring-)/,
        )?.[0]?.replace(/\d+/, '[digits]')?.replace(/xs|md|lg|(\d)*xl/, '[size]') ?? 'others';

        (classified[group] ??= []).push(className);

        return classified;
    }, {} as Record<string, string[]>);
}

export default {
    css(key: string): string {
        if (/^spacing\.\d+$/.test(key))
            return parseInt(key.substring(8)) * .25 + 'rem';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = key.split('.').reduce((value, part) => value?.[part], config as any);

        return typeof value === 'string' ? value : '0px';
    },
    mergeClasses(...classes: string[]): string {
        const mergedClasses = classes.reduce((merged, classes) => {
            const classified = classifyClasses(classes.split(' '));

            classified.others?.push(...merged.others ?? []);

            Object.assign(merged, classified);

            return merged;
        }, {} as Record<string, string[]>);

        return Object.values(mergedClasses).map(classes => classes.join(' ')).join(' ');
    },
    pixels(key: string): number {
        return memoizedPixels[key] ??= measurePixels(this.css(key));
    },
};
