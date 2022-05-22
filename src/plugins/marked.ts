import { marked } from 'marked';

import { renderCoreLink } from '@/utils/markdown';

marked.use({
    renderer: {
        link: (href, title, text) => renderCoreLink({ url: href ?? '#', text, title }),
    },
});
