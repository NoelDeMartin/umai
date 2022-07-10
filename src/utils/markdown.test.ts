/* eslint-disable max-len */
import '@/plugins/marked';

import { renderMarkdown } from './markdown';

describe('Markdown', () => {

    it('renders basic markdown', () => {
        // Arrange
        const expectedHTML = `
            <h1 id="title">Title</h1>
            <p>body with <a
                href="https://example.com"
                style="border-radius:\\d{1,3}px \\d{1,3}px \\d{1,3}px \\d{1,3}px / \\d{1,3}px \\d{1,3}px \\d{1,3}px \\d{1,3}px"
                target="_blank"
                class="no-underline hover:underline focus-visible:outline-none focus-visible:ring-2 text-primary-700 focus-visible:ring-primary-200 focus-visible:bg-primary-200 "
            >link</a></p>
            <ul>
                <li>One</li>
                <li>Two</li>
                <li>Three</li>
            </ul>
        `;

        // Act
        const html = renderMarkdown([
            '# Title',
            'body with [link](https://example.com)',
            '- One',
            '- Two',
            '- Three',
        ].join('\n'));

        // Assert
        expect(normalizeHTML(html)).toMatch(new RegExp(normalizeHTML(expectedHTML)));
    });

    it('renders button links', () => {
        // Arrange
        const expectedHTML = `
            <p><button
                type="button"
                style="border-radius:\\d{1,3}px \\d{1,3}px \\d{1,3}px \\d{1,3}px / \\d{1,3}px \\d{1,3}px \\d{1,3}px \\d{1,3}px"
                class="no-underline hover:underline focus-visible:outline-none focus-visible:ring-2 text-primary-700 focus-visible:ring-primary-200 focus-visible:bg-primary-200 "
                data-markdown-action="do-something"
            >link</button></p>
        `;

        // Act
        const html = renderMarkdown('[link](action:do-something)');

        // Assert
        expect(normalizeHTML(html)).toMatch(new RegExp(normalizeHTML(expectedHTML)));
    });

});

function normalizeHTML(html: string): string {
    const div = document.createElement('div');

    div.innerHTML = html.split('\n').map(line => line.trim()).join('\n').trim();
    div.normalize();

    return div.innerHTML;
}
