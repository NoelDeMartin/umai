import type { Plugin } from 'vite';

export default function VitePluginIndexReplacements(replacements: Record<string, string>): Plugin {
    return {
        name: 'vite-plugin-index-replacements',
        transformIndexHtml(html) {
            for (const [name, value] of Object.entries(replacements)) {
                html = html.replaceAll(new RegExp(`{{\\s*${name}\\s*}}`, 'g'), value);

                console;
            }

            return html;
        },
    };
}
