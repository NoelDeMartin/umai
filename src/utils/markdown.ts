import type { Content } from 'pdfmake/interfaces';

import { marked } from 'marked';
import { stringMatchAll } from '@noeldemartin/utils';

import { CoreColor } from '@/components/core';
import { randomWobblyBorderRadius } from '@/directives/wobbly-border';

let pdf = false;

function parseCoreLinkAttributes(attributes: string): {
    url: string;
    classes: string;
    color: string;
} {
    return {
        url: parseAttributeValue(attributes, 'url') ?? '#',
        classes: parseAttributeValue(attributes, 'class') ?? '',
        color: parseAttributeValue(attributes, 'color') ?? CoreColor.Primary,
    };
}

function parseAttributeValue(attributes: string, attribute: string): string | undefined {
    return attributes.match(new RegExp(`${attribute}="([^"]+)"`))?.[1];
}

function getCoreLinkColorClasses(color?: string | null): string {
    switch (color) {
        case CoreColor.Solid:
            return 'text-brand-solid-700 focus-visible:ring-brand-solid-100 focus-visible:bg-brand-solid-100';
        case CoreColor.Danger:
            return 'text-red-700 focus-visible:ring-red-100 focus-visible:bg-red-100';
        default:
            return 'text-primary-700 focus-visible:ring-primary-200 focus-visible:bg-primary-200';
    }
}

function renderCoreLinks(markdown: string): string {
    const matches = stringMatchAll<3>(markdown, /<CoreLink([^>]*)>([^<]+)<\/CoreLink>/g);

    for (const [match, attributes, text] of matches) {
        const { url, classes, color } = parseCoreLinkAttributes(attributes);

        markdown = markdown.replace(match, renderCoreLink({ url, text, color, classes }));
    }

    return markdown;
}

export interface CoreLinkAttributes {
    url: string;
    text: string;
    title?: string | null;
    color?: string | null;
    classes?: string | null;
}

export function isRenderingPDF(): boolean {
    return pdf;
}

export function renderPDF(text: string): Content {
    pdf = true;
    const content = marked(text);
    pdf = false;

    const matches = stringMatchAll<1, 1>(content, /\[\[(.*)\]\]/g);

    for (const match of matches) {
        console.log(match);
    }

    // TODO https://github.com/bpampuch/pdfmake/issues/1651
    // text: [
    //     { text: '...' },
    //     { text: 'google', link: 'http://google.com', style: 'link' },
    //     { text: '...' },
    // ],
    return { text: content };
}

export function renderCoreLink({ url, text, title, color, classes }: CoreLinkAttributes): string {
    const borderRadius = randomWobblyBorderRadius();
    const extraClasses = `${getCoreLinkColorClasses(color)} ${classes ?? ''}`;

    if (url.startsWith('action:')) {
        const baseClasses = 'no-underline hover:underline focus-visible:outline-none focus-visible:ring-2';

        return `<button
            type="button"
            style="border-radius:${borderRadius}" ${(title && `title="${title}"`) || ''}
            class="${baseClasses} ${extraClasses}"
            data-markdown-action="${url.substring('action:'.length)}"
        >${text}</button>`;
    }

    return `<a
        href="${url}"
        style="border-radius:${borderRadius}" ${(title && `title="${title}"`) || ''}
        ${ url.startsWith('/') ? '' : 'target="_blank"' }
        class="core-link no-underline hover:underline focus-visible:outline-none focus-visible:ring-2 ${extraClasses}"
    >${text}</a>`;
}

export function renderMarkdown(markdown: string): string {
    return marked(renderCoreLinks(markdown));
}
