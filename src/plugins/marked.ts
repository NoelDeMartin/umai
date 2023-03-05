import { marked } from 'marked';

import { isRenderingPDF, renderCoreLink } from '@/utils/markdown';

marked.use({
    renderer: {
        link: (href, title, text) => {
            if (isRenderingPDF()) {
                const json = JSON.stringify({ text, link: href, style: 'link' });

                return `[[${json}]]`;
            }

            return renderCoreLink({ url: href ?? '#', text, title });
        },
        paragraph: text => {
            if (isRenderingPDF()) {
                const json = JSON.stringify({ text });

                return `[[${json}]]`;
            }

            return `<p>${text}</p>`;
        },
    },
});
